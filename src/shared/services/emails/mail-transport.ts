import nodemailer from 'nodemailer';
import sendGridMail from '@sendgrid/mail';
import { config } from '@root/config';
import { BadRequestError } from '@global/helpers/error-handler';
import Mail from 'nodemailer/lib/mailer';

interface IMailOptions {
  from: string;
  to: string;
  subject: string;
  html: string;
}

sendGridMail.setApiKey(config.SENDGRID_API_KEY!);

export const sendEmail = (receiverEmail: string, subject: string, body: string) => {
  if (config.NODE_ENV == 'test' || config.NODE_ENV == 'development') {
    developmentMailSender(receiverEmail, subject, body);
  } else {
    productionEmailSender(receiverEmail, subject, body);
  }
};

const developmentMailSender = async (receiverEmail: string, subject: string, body: string): Promise<void> => {
  const transporter: Mail = await nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: config.SENDER_EMAIL!,
      pass: config.SENDER_EMAIL_PASSWORDs
    }
  });
  const mailOptions: IMailOptions = {
    from: `Wandrooz ${config.SENDER_EMAIL!}`,
    to: receiverEmail,
    subject,
    html: body
  };
  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.log(error);
    throw new BadRequestError('Error sending email');
  }
};
const productionEmailSender = async (receiverEmail: string, subject: string, body: string): Promise<void> => {
  const mailOptions: IMailOptions = {
    from: `Wandrooz ${config.SENDER_EMAIL!}`,
    to: receiverEmail,
    subject,
    html: body
  };
  try {
    await sendGridMail.send(mailOptions);
    console.log('Production Email Sent Successfully');
  } catch (error) {
    throw new BadRequestError('Error sending email');
  }
};
