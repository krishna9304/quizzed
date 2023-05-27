export const getOtpTemplate = (name: string, otp: number, regdNo: string) => {
  return `
  <div style="justify-content: center; align-items: center; flex-direction: column; text-align: center; padding: 20px;" >
        <h1>
            Hello ${name},
        </h1>
        <h2>
            Welcome to Quizzed! Please keep a note of your registration number - ${regdNo}.
        </h2>
        <br/>
        <p>
            This email is sent to you because you registered yourself in the \`Quizzed\` application.
            To Verify your account please enter the below OTP in the quizzed application.
        </p>
        <h1>
            ${otp}
        </h1>
        <p>
            This is an auto-generated mail, please do not reply to this.
        </p>
    </div>`;
};
