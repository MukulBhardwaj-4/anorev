import {
  Html,
  Head,
  Font,
  Preview,
  Heading,
  Row,
  Section,
  Text,
  Hr,
} from '@react-email/components';

interface VerificationEmailProps {
  otp: string;
}

export default function VerificationEmail({
  otp = '123456',
}: VerificationEmailProps) {
  const otpDigits = otp.split('');

  return (
    <Html lang="en" dir="ltr">
      <Head>
        <title>Your verification code</title>
        <Font
          fontFamily="Roboto"
          fallbackFontFamily="Verdana"
          webFont={{
            url: 'https://fonts.gstatic.com/s/roboto/v27/KFOmCnqEu92Fr1Mu4mxKKTU1Kg.woff2',
            format: 'woff2',
          }}
          fontWeight={400}
          fontStyle="normal"
        />
        {/* Mobile overrides — keeps the 6-digit code on a single line on narrow screens */}
        <style>
          {`
            @media only screen and (max-width: 480px) {
              .av-outer { padding: 28px 8px !important; }
              .av-header { padding: 18px 22px !important; }
              .av-body { padding: 28px 16px 22px !important; }
              .av-footer { padding: 14px 22px !important; }
              .av-otp-box { gap: 8px !important; }
              .av-otp-digit {
                width: 28px !important;
                height: 42px !important;
                line-height: 42px !important;
                font-size: 19px !important;
              }
            }
          `}
        </style>
      </Head>

      <Preview>Your verification code is {otp} — valid for 10 minutes</Preview>

      <Section style={outer} className="av-outer">
        <Section style={card}>

          <Section style={header} className="av-header">
            <Heading as="h1" style={logoText}>
              <span style={logoMark} />
              <span style={logoWordmark}>
                ano<span style={logoAccent}>rev</span>
              </span>
            </Heading>
          </Section>

          <Section style={body} className="av-body">
            <Row>
              <Heading as="h2" style={greeting}>
                Verify your identity
              </Heading>
            </Row>

            <Row>
              <Text style={bodyText}>
                Use the one-time code below to continue. It expires in{' '}
                <strong style={bodyTextStrong}>10 minutes</strong> and can
                only be used once.
              </Text>
            </Row>

            <Row>
              <Section style={otpWrapper}>
                <Section style={otpBox} className="av-otp-box">
                  {otpDigits.map((digit, i) => (
                    <span key={i} style={otpDigitStyle} className="av-otp-digit">
                      {digit}
                    </span>
                  ))}
                </Section>
                <Text style={otpHint}>Enter this code on the verification page</Text>
              </Section>
            </Row>

            <Hr style={divider} />

            <Row>
              <Section style={securityNote}>
                <Text style={securityNoteLabel}>Security note</Text>
                <Text style={securityNoteText}>
                  If you didn't request this code, you can safely ignore this
                  email. No further action is needed.
                </Text>
              </Section>
            </Row>
          </Section>

          <Section style={footer} className="av-footer">
            <Text style={footerText}>Anorev · This is an automated message</Text>
          </Section>
        </Section>
      </Section>
    </Html>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────

const outer: React.CSSProperties = {
  backgroundColor: '#0A0A0B',
  padding: '48px 16px',
  fontFamily: 'Roboto, Verdana, sans-serif',
};

const card: React.CSSProperties = {
  maxWidth: '480px',
  width: '100%',
  margin: '0 auto',
  backgroundColor: '#131315',
  borderRadius: '12px',
  overflow: 'hidden',
  border: '1px solid #1F1F23',
};

const header: React.CSSProperties = {
  padding: '24px 36px',
  borderBottom: '1px solid #1F1F23',
};

const logoText: React.CSSProperties = {
  margin: 0,
  display: 'flex',
  alignItems: 'center',
};

const logoMark: React.CSSProperties = {
  display: 'inline-block',
  width: '9px',
  height: '9px',
  borderRadius: '2px',
  backgroundColor: '#F4F4F5',
  marginRight: '10px',
};

const logoWordmark: React.CSSProperties = {
  fontFamily: 'Roboto Mono, Menlo, monospace',
  fontSize: '15px',
  fontWeight: 600,
  color: '#F4F4F5',
  letterSpacing: '-0.2px',
};

const logoAccent: React.CSSProperties = {
  color: '#71717A',
};

const body: React.CSSProperties = {
  padding: '36px 40px 28px',
};

const greeting: React.CSSProperties = {
  fontSize: '19px',
  fontWeight: 600,
  color: '#F4F4F5',
  margin: '0 0 12px',
  letterSpacing: '-0.2px',
};

const bodyText: React.CSSProperties = {
  fontSize: '14px',
  lineHeight: '1.65',
  color: '#A1A1AA',
  margin: '0 0 32px',
};

const bodyTextStrong: React.CSSProperties = {
  color: '#D4D4D8',
  fontWeight: 600,
};

const otpWrapper: React.CSSProperties = {
  textAlign: 'center',
  margin: '0 0 32px',
};

const otpBox: React.CSSProperties = {
  display: 'inline-flex',
  flexWrap: 'nowrap',
  gap: '16px',
  margin: '0 auto 16px',
};

const otpDigitStyle: React.CSSProperties = {
  display: 'inline-block',
  width: '34px',
  height: '46px',
  lineHeight: '46px',
  textAlign: 'center',
  fontSize: '24px',
  fontWeight: 600,
  fontFamily: 'Roboto Mono, Menlo, monospace',
  color: '#F4F4F5',
  borderBottom: '2px solid #3F3F46',
};

const otpHint: React.CSSProperties = {
  fontSize: '11px',
  color: '#52525B',
  margin: '0',
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
};

const divider: React.CSSProperties = {
  borderColor: '#1F1F23',
  margin: '0 0 24px',
};

const securityNote: React.CSSProperties = {
  backgroundColor: '#17171A',
  border: '1px solid #1F1F23',
  borderRadius: '8px',
  padding: '14px 18px',
};

const securityNoteLabel: React.CSSProperties = {
  fontSize: '11px',
  fontWeight: 600,
  color: '#71717A',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  margin: '0 0 6px',
};

const securityNoteText: React.CSSProperties = {
  fontSize: '12.5px',
  color: '#8E8E96',
  lineHeight: '1.6',
  margin: 0,
};

const footer: React.CSSProperties = {
  padding: '18px 36px',
  borderTop: '1px solid #1F1F23',
};

const footerText: React.CSSProperties = {
  fontSize: '11.5px',
  color: '#52525B',
  textAlign: 'center',
  margin: 0,
};