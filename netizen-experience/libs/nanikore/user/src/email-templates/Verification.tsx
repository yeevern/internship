import { Body, Button, Container, Head, Heading, Html, Section, Text } from "@react-email/components";
import { render } from "@react-email/render";
import * as React from "react";

export function VerificationEmail({ verificationLink }: { verificationLink: string }) {
  const main = {
    backgroundColor: "#ffffff",
    fontFamily:
      '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
    textAlign: "center" as const,
  };

  const header = {
    margin: "0 auto",
    padding: "48px",
  };

  const logo = {
    backgroundColor: "#808080",
    margin: "auto",
    height: "40px",
    width: "80px",
  };

  const image = {
    backgroundColor: "#808080",
    margin: "0 auto 16px",
    width: "252px",
    height: "252px",
  };
  const heading = {
    fontSize: "24px",
    letterSpacing: "-0.5px",
    lineHeight: "1.3",
    fontWeight: "600",
    color: "#000000",
    padding: "10px 0",
  };

  const content = {
    padding: "32px 48px",
    minWidth: "100%",
  };

  const paragraph = {
    margin: "16px 0",
    fontSize: "16px",
    lineHeight: "1.4",
    color: "#000000",
  };

  const subHeading = {
    margin: "16px 0",
    fontSize: "20px",
    lineHeight: "1.4",
    color: "#000000",
    fontWeight: "600",
  };

  const button = {
    width: "fit-content",
    padding: "8px 16px",
    backgroundColor: "#5e6ad2",
    borderRadius: "3px",
    fontWeight: "600",
    color: "#fff",
    fontSize: "16px",
    textDecoration: "none",
    textAlign: "center" as const,
    display: "block",
  };

  const footer = {
    fontSize: "14px",
    padding: "24px 48px",
    color: "#000000",
    minWidth: "100%",
  };

  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={header}>
          <Section style={logo} />
          <Heading style={heading}>Verify your email</Heading>
        </Container>
        <Container style={content}>
          <Section style={image} />
          <Text style={subHeading}>One last step</Text>
          <Text style={paragraph}>
            Welcome to Nanikore!
            <br />
            Help us verify your email to complete the sign up process
            <br />
            Your code is {"{####}"}
          </Text>
          <Button style={button} href={verificationLink}>
            Verify email
          </Button>
        </Container>
        <Container style={footer}>
          Thank you for being part of our mailing list.
          <br />
          Periodically, we share valuable tips and tricks to maximize your Nanikore experience.
          <br />
          If you prefer not to receive these emails, click the link below
          <br />
          <u>unsubscribe</u>
        </Container>
      </Body>
    </Html>
  );
}

export const verificationEmailHtml = render(<VerificationEmail verificationLink="{##Verify Email##}" />);
