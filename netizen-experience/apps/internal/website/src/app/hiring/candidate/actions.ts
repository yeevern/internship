"use server";

import { z } from "zod";
import { getSession } from "@/googleAuth/session";
import { candidateSchema } from "./schema";

const mailerApi = "https://api.netizenexperience.com/mailer";
const careerPackLink = "https://drive.google.com/file/d/1a-4nNzqSyBYZASI0YkStkvWsDEBz_kWN/view?usp=sharing";

async function sendEmail(data: z.infer<typeof candidateSchema>) {
  const emailDetails =
    data.candidateStatus === "Rejected"
      ? {
          to: `${data.candidateEmail}`,
          key: "429dc974-9ac3-4b6f-9b9d-3070656ac7f6",
          subject: `Netizen Career via ${data.candidateSource} (${data.jobRole})`,
          content: {
            html: `<p style="margin:0 0 8px">Dear ${data.candidateName},<br /><br />Thank you for your interest in this position, however we have decided not to move forward with your application.<br /><br />We wish you all the best in your future endeavours.<br /><br />Regards,</p><p style="margin:0;font-family:Calibri,sans-serif;font-size:10pt;color:#666"><span style="font-size:11pt;font-weight:700;color:#003e74">Rachel</span><span style="font-size:11pt">&nbsp;|&nbsp;</span><b>Support Team</b><br /><br /><b>T&nbsp;</b><a href="tel:+60350365036" style="color:#1155cc;text-decoration:underline">+603 5036 5036</a>&nbsp;&nbsp;&nbsp;&nbsp;<b>W&nbsp;</b><a href="https://www.netizenexperience.com/?utm_source=signature&utm_medium=email&utm_campaign=websitelink" style="color:#1155cc;text-decoration:underline">NetizenExperience.com</a><br /><b>Netizen Experience:&nbsp;&nbsp;<i>Analytics, UX Testing &amp; Research Consultancy</i></b><br /><a href="https://www.facebook.com/netizenexperience" style="color:#1155cc;text-decoration:underline">Facebook</a>&nbsp;|&nbsp;<a href="https://www.linkedin.com/company/netizen-experience" style="color:#1155cc;text-decoration:underline">LinkedIn</a></p>`,
            text: `Dear ${data.candidateName},\n\nThank you for your interest in this position, however we have decided not to move forward with your application.\n\nWe wish you all the best in your future endeavours.\n\nRegards,\nRachel | Support Team,`,
          },
        }
      : {
          to: `${data.candidateEmail}`,
          key: "429dc974-9ac3-4b6f-9b9d-3070656ac7f6",
          subject: `Netizen Career via ${data.candidateSource} (${data.jobRole})`,
          content: {
            html: `<p style="margin:0 0 8px">Dear ${data.candidateName},<br /><br />Thank you for your application. We're now in the midst of reviewing the applications that we've received. <br /><br />Meanwhile, please proceed to <a href="${careerPackLink}">read our Career Pack</a> to learn more about our company.<br /><br />Look forward to hearing from you after you've finished reading the career pack. :)<br /><br />Cheers,</p><p style="margin:0;font-family:Calibri,sans-serif;font-size:10pt;color:#666"><span style="font-size:11pt;font-weight:700;color:#003e74">Rachel</span><span style="font-size:11pt">&nbsp;|&nbsp;</span><b>Support Team</b><br /><br /><b>T&nbsp;</b><a href="tel:+60350365036" style="color:#1155cc;text-decoration:underline">+603 5036 5036</a>&nbsp;&nbsp;&nbsp;&nbsp;<b>W&nbsp;</b><a href="https://www.netizenexperience.com/?utm_source=signature&utm_medium=email&utm_campaign=websitelink" style="color:#1155cc;text-decoration:underline">NetizenExperience.com</a><br /><b>Netizen Experience:&nbsp;&nbsp;<i>Analytics, UX Testing &amp; Research Consultancy</i></b><br /><a href="https://www.facebook.com/netizenexperience" style="color:#1155cc;text-decoration:underline">Facebook</a>&nbsp;|&nbsp;<a href="https://www.linkedin.com/company/netizen-experience" style="color:#1155cc;text-decoration:underline">LinkedIn</a></p>`,
            text: `Dear ${data.candidateName},\n\nThank you for your application. We're now in the midst of reviewing the applications that we've received.\n\nMeanwhile, please proceed to read our Career Pack (https://drive.google.com/file/d/1a-4nNzqSyBYZASI0YkStkvWsDEBz_kWN/view?usp=sharing) to learn more about our company.\n\nLook forward to hearing from you after you've finished reading the career pack. :)\n\nCheers,\nRachel | Support Team`,
          },
        };
  try {
    const response = await fetch(mailerApi, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(emailDetails),
    });
    if (response.ok) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    return false;
  }
}

export async function createCandidate(data: z.infer<typeof candidateSchema>) {
  const session = await getSession();
  const emailResponse = await sendEmail(data);

  const candidateData = {
    candidateName: data.candidateName,
    candidateEmail: data.candidateEmail,
    jobRole: data.jobRole,
    candidateSource: data.candidateSource,
    candidateStatus: data.candidateStatus,
    rejectReason: data.rejectionReason,
    reporter: session?.id,
  };

  return { candidateData, emailResponse };
}
