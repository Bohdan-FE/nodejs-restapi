import nodemailer from 'nodemailer'
import smtpTransport from 'nodemailer-smtp-transport'
import 'dotenv/config'

const { GMAIL_PASSWORD } = process.env

const nodemailerConfig = {
    service: 'gmail',
    host: 'smtp.gmail.com',
    auth: {
        user: 'pavlbodia@gmail.com',
        pass: GMAIL_PASSWORD
    }
}

const transport = nodemailer.createTransport(smtpTransport(nodemailerConfig))

const sendEmail = async (data) => {
    const email = { ...data, from: 'pavlbodia@gmail.com' }
    await transport.sendMail(email)
    return true
}

export default sendEmail