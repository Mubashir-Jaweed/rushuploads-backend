import { env } from "../lib/env";
import { nodemailerTransporter } from "../lib/nodemailer";
import { prisma } from "../lib/prisma";

async function createMail(payload: {
  to: string[];
  title?: string;
  message?: string;
  fileIds: string[];
  userId: string;
}) {
  const mail = await prisma.link.create({
    data: {
      to: payload.to,
      title: payload.title,
      message: payload.message,
      files: {
        connect: payload.fileIds.map((id) => ({ id })),
      },
      user: {
        connect: {
          id: payload.userId,
        },
      },
    },
    select: {
      id: true,
      to: true,
      title: true,
      message: true,
      updatedAt: true,
      files: {
        select: {
          id: true,
          originalName: true,
          name: true,
          type: true,
          downloads: true,
          claims: true,
          isExpired: true,
          isDeleted: true,
          expiredAt: true,
          updatedAt: true,
          user: {
            select: {
              email: true,
              profile: {
                select: {
                  fullName: true,
                },
              },
            },
          },
          link: {
            select: {
              id: true,
            },
          },
        },
      },
    },
  });

  return { mail };
}

async function sendOTP({
  to,
  code,
}: {
  to: string;
  code: string;
}) {
  nodemailerTransporter.sendMail(
    {
      from: {
        name: "Rush Uploads",
        address: "support@rushuploads.com",
      },
      to,
      subject: "Verify Your Email",
      text: `Your OTP Code is: ${code}`,
    },
    (err) => {
      if (err) {
        console.error(err);
      }
    },
  );
}

async function sendFiles({
  senderEmail,
  recipientEmail,
  title,
  message,
  link,
}: {
  senderEmail: string;
  recipientEmail: string;
  title: string;
  message: string;
  link: string;
}) {
  nodemailerTransporter.sendMail(
    {
      from: {
        name: env.APP_NAME,
        address: env.APP_SUPPORT_EMAIL,
      },
      to: recipientEmail,
      subject: title,
      html: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Files Are Ready</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #1c1c1e; /* Dark background */
            color: #ffffff; /* Light text */
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #2a2a2d; /* Slightly lighter background for the card */
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.5); /* Soft shadow */
            padding: 20px;
        }
        .header {
            text-align: center;
            padding: 20px 0;
            background: linear-gradient(45deg, #ff416c, #ff4b2b); /* Gradient header */
            color: white;
            border-radius: 16px 16px 0 0;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
        }
        .content {
            padding: 20px;
            text-align: center;
        }
        .content p {
            margin: 10px 0;
            color: #bbbbbb; /* Softer text */
        }
      .cta-button {
    display: inline-block;
    margin: 20px auto 5px;
    padding: 12px 24px;
    background-color: #4a4a4a; /* Neutral gray background */
    color: #ffffff; /* White text */
    text-decoration: none;
    font-weight: bold;
    border-radius: 8px;
    transition: background-color 0.3s ease-in-out;
    text-align: center;
}
.cta-button:hover {
    background-color: #6a6a6a; /* Slightly lighter gray on hover */
    text-decoration: none;
}
.cta-button:visited {
    color: #ffffff; /* Ensure visited color stays consistent */
    text-decoration: none;
}
.cta-button:active {
    background-color: #3a3a3a; /* Darker gray on active */
    text-decoration: none;
}
        .footer {
            text-align: center;
            margin-top: 5px;
            padding: 10px;
            font-size: 12px;
            color: #aaaaaa;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Your Files Are Ready!</h1>
        </div>
        <div class="content">
            <p>Hello,</p>
            <p>You have received some files from <strong style="color: white;">${senderEmail}</strong>. Click the button below to download them:</p>
            <a href="${link}" style="color: white;" class="cta-button">Get Files</a>
            ${
              message &&
              `
            <p><strong>Message from sender:</strong></p>
            <p>${message}</p>
            `
            }
        </div>
        <div class="footer">
            <p>Delivered via <strong>Rush Uploads</strong></p>
        </div>
    </div>
</body>
</html>
      `,
    },
    (err) => {
      if (err) {
        console.error(err);
      }
    },
  );
}

export { createMail, sendOTP, sendFiles };
