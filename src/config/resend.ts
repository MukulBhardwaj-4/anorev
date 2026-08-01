import VerificationEmail from '@/components/VerifyEmailTemplate';
import { Resend } from 'resend';
import { auth } from '@/lib/auth';

const resend = new Resend(process.env.RESEND_API_KEY);

interface IResend {
    success: boolean,
    message: string,
}
export const sendEmail = async (
    email: string,
    otp: string,
    type: string,
): Promise<IResend> => {
    try {
        await resend.emails.send({
            from: 'anorev <astraaero@send.astraaero.work.gd>',
            to: email,
            subject: type,
            react: VerificationEmail({otp: otp }),
        });

        return { success: true, message: "Verification email sent successfully" }
    } catch (error) {
        console.error("Error in sending verification email :", error);
        throw new Error("Failed to send verification email");
    }
}