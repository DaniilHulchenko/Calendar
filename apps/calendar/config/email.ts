export const sendEmail = (to: string, htmlTemplate: string, subject: string) => {
  return fetch("/api/send-email", {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({to, htmlTemplate, subject})
  }) ///api/send-email
    .then((res) => res.json())
    .then((data) => data);
};
