import PDFDocument from "pdfkit";
import { PrescriptionPdfData } from "../module/prescription/prescription.interface";

const TEAL = "#0d9488";
const DEEP_TEAL = "#0f766e";
const INK = "#0f172a";
const MUTED = "#64748b";
const LINE = "#e2e8f0";
const SOFT = "#f8fafc";
const MINT = "#f0fdfa";
const MINT_LINE = "#99f6e4";

const MARGIN = 50;
const FOOTER_ZONE = 120;
const FOOTER_LINE_OFFSET = 88;

const fmtDate = (value?: string | Date | null) => {
	if (!value) return "N/A";
	const date = value instanceof Date ? value : new Date(value);
	return Number.isNaN(date.getTime())
		? String(value)
		: date.toLocaleDateString("en-GB", {
				day: "2-digit",
				month: "short",
				year: "numeric",
			});
};

const fmtDateTime = (value?: string | Date | null) => {
	if (!value) return "N/A";
	const date = value instanceof Date ? value : new Date(value);
	return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString();
};

export const generatePrescriptionPdf = (
	data: PrescriptionPdfData,
): Promise<Buffer> =>
	new Promise((resolve, reject) => {
		try {
			const doc = new PDFDocument({
				size: "A4",
				margin: MARGIN,
				bufferPages: true,
			});
			const chunks: Buffer[] = [];

			doc.on("data", (chunk: Buffer) => chunks.push(chunk));
			doc.on("end", () => resolve(Buffer.concat(chunks)));
			doc.on("error", reject);

			const pageWidth = doc.page.width;
			const pageHeight = doc.page.height;
			const right = pageWidth - MARGIN;
			const contentWidth = right - MARGIN;
			const bottomLimit = pageHeight - FOOTER_ZONE;

			/** Hard-trims a string so it can never spill into the next line/row. */
			const clip = (
				text: string,
				width: number,
				font: string,
				size: number,
			) => {
				doc.font(font).fontSize(size);
				if (doc.widthOfString(text) <= width) return text;
				let out = text;
				while (out.length > 1 && doc.widthOfString(`${out}...`) > width) {
					out = out.slice(0, -1);
				}
				return `${out.trimEnd()}...`;
			};

			const issuedAt = data.issuedAt ?? new Date();
			const shortId = data.prescriptionId.slice(0, 8).toUpperCase();

			/* -------------------------------------------------------- */
			/*  Header band                                             */
			/* -------------------------------------------------------- */
			const drawHeader = (compact = false) => {
				const height = compact ? 56 : 104;
				doc.rect(0, 0, pageWidth, height).fill(TEAL);

				doc
					.fillColor("#ffffff")
					.font("Helvetica-Bold")
					.fontSize(compact ? 14 : 20)
					.text("+ HealthCare", MARGIN, compact ? 20 : 30);

				doc
					.font("Helvetica")
					.fontSize(compact ? 8 : 10)
					.fillColor("#d5f5f0")
					.text(
						compact ? "Prescription (continued)" : "Medical Prescription",
						MARGIN,
						compact ? 37 : 58,
					);

				doc
					.font("Helvetica-Bold")
					.fontSize(compact ? 10 : 12)
					.fillColor("#ffffff")
					.text(`RX-${shortId}`, MARGIN, compact ? 21 : 32, {
						width: contentWidth,
						align: "right",
					});

				if (!compact) {
					doc
						.font("Helvetica")
						.fontSize(9)
						.fillColor("#d5f5f0")
						.text(`Issued ${fmtDate(issuedAt)}`, MARGIN, 52, {
							width: contentWidth,
							align: "right",
						});
					doc
						.font("Helvetica")
						.fontSize(9)
						.fillColor("#d5f5f0")
						.text(
							`Serial #${data.appointment.serialNumber ?? "N/A"}`,
							MARGIN,
							66,
							{ width: contentWidth, align: "right" },
						);
				}

				return height;
			};

			const newPage = () => {
				doc.addPage();
				return drawHeader(true) + 30;
			};

			let y = drawHeader() + 30;

			/* -------------------------------------------------------- */
			/*  Doctor / patient cards                                  */
			/* -------------------------------------------------------- */
			const cardGap = 16;
			const cardWidth = (contentWidth - cardGap) / 2;
			const cardHeight = 108;

			const drawCard = (
				x: number,
				title: string,
				name: string,
				rows: Array<[string, string]>,
			) => {
				doc
					.roundedRect(x, y, cardWidth, cardHeight, 10)
					.fillAndStroke(SOFT, LINE);

				doc
					.font("Helvetica")
					.fontSize(8)
					.fillColor(TEAL)
					.text(title, x + 14, y + 14, {
						width: cardWidth - 28,
						characterSpacing: 0.8,
					});

				doc
					.font("Helvetica-Bold")
					.fontSize(12)
					.fillColor(INK)
					.text(
						clip(name, cardWidth - 28, "Helvetica-Bold", 12),
						x + 14,
						y + 28,
						{
							width: cardWidth - 28,
							lineBreak: false,
						},
					);

				let lineY = y + 48;
				for (const [label, value] of rows) {
					doc
						.font("Helvetica")
						.fontSize(8.5)
						.fillColor(MUTED)
						.text(label, x + 14, lineY, { width: 62, lineBreak: false });
					doc
						.font("Helvetica-Bold")
						.fontSize(8.5)
						.fillColor(INK)
						.text(
							clip(value, cardWidth - 92, "Helvetica-Bold", 8.5),
							x + 78,
							lineY,
							{ width: cardWidth - 92, lineBreak: false },
						);
					lineY += 14;
				}
			};

			const doctorTitle = data.doctor.qualification
				? `${data.doctor.specialization} · ${data.doctor.qualification}`
				: data.doctor.specialization;

			drawCard(MARGIN, "PRESCRIBED BY", `Dr. ${data.doctor.name}`, [
				["Specialty", doctorTitle],
				["License", data.doctor.licenseNumber],
				["Contact", data.doctor.contactNumber || data.doctor.email || "N/A"],
			]);

			drawCard(MARGIN + cardWidth + cardGap, "PATIENT", data.patient.name, [
				["Contact", data.patient.contactNumber || "N/A"],
				["Email", data.patient.email || "N/A"],
				["Visited", fmtDateTime(data.appointment.joiningTime)],
			]);

			y += cardHeight + 28;

			/* -------------------------------------------------------- */
			/*  Findings / diagnosis                                    */
			/* -------------------------------------------------------- */
			doc
				.font("Helvetica")
				.fontSize(9)
				.fillColor(MUTED)
				.text("FINDINGS & DIAGNOSIS", MARGIN, y, { characterSpacing: 0.8 });
			y += 16;

			const findings = data.findings?.trim() || "No findings recorded.";
			const findingsHeight =
				doc
					.font("Helvetica")
					.fontSize(10)
					.heightOfString(findings, {
						width: contentWidth - 32,
						lineGap: 3,
					}) + 28;

			if (y + findingsHeight > bottomLimit) y = newPage();

			doc
				.roundedRect(MARGIN, y, contentWidth, findingsHeight, 10)
				.fillAndStroke(MINT, MINT_LINE);
			doc
				.font("Helvetica")
				.fontSize(10)
				.fillColor(INK)
				.text(findings, MARGIN + 16, y + 14, {
					width: contentWidth - 32,
					lineGap: 3,
				});

			y += findingsHeight + 28;

			/* -------------------------------------------------------- */
			/*  Rx – medicines table                                    */
			/* -------------------------------------------------------- */
			const cols = [
				{ label: "#", width: 34 },
				{ label: "MEDICINE", width: 132 },
				{ label: "DOSAGE", width: 92 },
				{ label: "DURATION", width: 82 },
				{ label: "INSTRUCTIONS", width: contentWidth - 34 - 132 - 92 - 82 },
			];
			const colX = cols.reduce<number[]>((acc, col, index) => {
				acc.push(index === 0 ? MARGIN : acc[index - 1] + cols[index - 1].width);
				return acc;
			}, []);

			const drawRxTitle = () => {
				doc
					.font("Helvetica-Bold")
					.fontSize(22)
					.fillColor(DEEP_TEAL)
					.text("Rx", MARGIN, y - 6);
				doc
					.font("Helvetica")
					.fontSize(9)
					.fillColor(MUTED)
					.text("MEDICATION PLAN", MARGIN + 34, y + 3, {
						characterSpacing: 0.8,
					});
				y += 26;
			};

			const drawTableHead = () => {
				doc.rect(MARGIN, y, contentWidth, 24).fill(DEEP_TEAL);
				cols.forEach((col, index) => {
					doc
						.font("Helvetica-Bold")
						.fontSize(8)
						.fillColor("#ffffff")
						.text(col.label, colX[index] + 8, y + 8, {
							width: col.width - 12,
							characterSpacing: 0.6,
							lineBreak: false,
						});
				});
				y += 24;
			};

			if (y + 110 > bottomLimit) y = newPage();
			drawRxTitle();
			drawTableHead();

			const medicines = data.medicines ?? [];

			if (medicines.length === 0) {
				doc.rect(MARGIN, y, contentWidth, 34).fillAndStroke(SOFT, LINE);
				doc
					.font("Helvetica-Oblique")
					.fontSize(10)
					.fillColor(MUTED)
					.text("No medicine prescribed.", MARGIN, y + 12, {
						width: contentWidth,
						align: "center",
					});
				y += 34;
			}

			medicines.forEach((medicine, index) => {
				const cells = [
					String(index + 1).padStart(2, "0"),
					medicine.name,
					medicine.dosage,
					medicine.duration,
					medicine.instructions?.trim() || "—",
				];

				doc.font("Helvetica").fontSize(9);
				const rowHeight =
					Math.max(
						...cells.slice(1).map((cell, cellIndex) =>
							doc.heightOfString(cell, {
								width: cols[cellIndex + 1].width - 16,
								lineGap: 2,
							}),
						),
						14,
					) + 16;

				if (y + rowHeight > bottomLimit) {
					y = newPage();
					drawTableHead();
				}

				if (index % 2 === 1) {
					doc.rect(MARGIN, y, contentWidth, rowHeight).fill(SOFT);
				}

				cells.forEach((cell, cellIndex) => {
					const isName = cellIndex === 1;
					doc
						.font(isName ? "Helvetica-Bold" : "Helvetica")
						.fontSize(9)
						.fillColor(isName ? INK : cellIndex === 0 ? MUTED : "#334155")
						.text(cell, colX[cellIndex] + 8, y + 8, {
							width: cols[cellIndex].width - 16,
							lineGap: 2,
							lineBreak: cellIndex !== 0,
						});
				});

				y += rowHeight;
				doc
					.moveTo(MARGIN, y)
					.lineTo(right, y)
					.lineWidth(0.5)
					.strokeColor(LINE)
					.stroke();
			});

			/* -------------------------------------------------------- */
			/*  Signature                                               */
			/* -------------------------------------------------------- */
			if (y + 100 > bottomLimit) y = newPage();
			y += 56;

			doc
				.moveTo(right - 190, y)
				.lineTo(right, y)
				.lineWidth(0.8)
				.strokeColor(MUTED)
				.stroke();
			doc
				.font("Helvetica-Bold")
				.fontSize(10)
				.fillColor(INK)
				.text(`Dr. ${data.doctor.name}`, right - 190, y + 8, {
					width: 190,
					align: "right",
					lineBreak: false,
				});
			doc
				.font("Helvetica")
				.fontSize(8.5)
				.fillColor(MUTED)
				.text(`License: ${data.doctor.licenseNumber}`, right - 190, y + 22, {
					width: 190,
					align: "right",
					lineBreak: false,
				});

			/* -------------------------------------------------------- */
			/*  Footer on every page                                    */
			/* -------------------------------------------------------- */
			const range = doc.bufferedPageRange();
			for (let i = range.start; i < range.start + range.count; i++) {
				doc.switchToPage(i);
				const footerY = pageHeight - FOOTER_LINE_OFFSET;

				doc
					.moveTo(MARGIN, footerY)
					.lineTo(right, footerY)
					.lineWidth(0.5)
					.strokeColor(LINE)
					.stroke();

				doc
					.font("Helvetica")
					.fontSize(8)
					.fillColor(MUTED)
					.text(
						"Digitally generated by HealthCare - valid without a physical signature. " +
							"Take the medicines exactly as directed. Query: support@healthcare.com",
						MARGIN,
						footerY + 10,
						{
							width: contentWidth - 70,
							height: 26,
							lineGap: 2,
							ellipsis: true,
						},
					);

				doc
					.font("Helvetica-Bold")
					.fontSize(8)
					.fillColor(MUTED)
					.text(
						`${i - range.start + 1} / ${range.count}`,
						right - 60,
						footerY + 10,
						{ width: 60, align: "right", lineBreak: false },
					);
			}

			doc.flushPages();
			doc.end();
		} catch (error) {
			reject(error);
		}
	});
