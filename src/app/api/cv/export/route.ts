import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { html } = await req.json()
    if (!html) return new Response('Missing html', { status: 400 })

    // Import puppeteer dynamically to avoid bundling in client bundles
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const puppeteer = require('puppeteer')

    const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] })
    const page = await browser.newPage()

    await page.setContent(html, { waitUntil: 'networkidle0' })

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '10mm', bottom: '10mm', left: '10mm', right: '10mm' },
    })

    await browser.close()

    return new Response(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Length': String(pdfBuffer.length),
      },
    })
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Puppeteer PDF generation failed:', err)
    return new Response('PDF generation failed', { status: 500 })
  }
}
