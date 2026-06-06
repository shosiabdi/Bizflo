import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
})

export async function POST(req: Request) {
  try {
    const { to, subject, html } = await req.json()
    await transporter.sendMail({
      from: `BizFlow <${process.env.GMAIL_USER}>`,
      to,
      subject,
      html,
    })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Email error:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}