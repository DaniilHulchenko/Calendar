import { NextApiRequest, NextApiResponse } from "next";
import sgMail from "@sendgrid/mail";

const emailHandler = async (
  request: NextApiRequest,
  response: NextApiResponse
) => {
  if (request.method !== "POST") {
    response.status(405).send({ message: "Only POST requests allowed" });
    return;
  }

  sgMail.setApiKey(
    process.env.SENDGRID_API_KEY ||
      "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"
  );
  const msg = {
    to: request.body.to,
    from: "schichtplan@exeo.de", // Use the email address or domain you verified above
    subject: request.body.subject,
    html: request.body.htmlTemplate,
  };
  //ES6
  sgMail.send(msg).then(
    () => {},
    (error: any) => {
      console.error(error);

      if (error.response) {
        console.error(error.response.body);
      }
    }
  );
  //ES8
  (async () => {
    try {
      await sgMail.send(msg);
      response.status(200).send({ message: "Message requested" });
    } catch (error: any) {
      console.error(error);

      if (error.response) {
        console.error(error.response.body);
      }
    }
  })();
};
export default emailHandler;
