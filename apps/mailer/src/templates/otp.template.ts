export const getOtpTemplate = (name: string, otp: number) => {
  return `<div style="justify-content: center; align-items: center; flex-direction: column; text-align: center; background-color: #191920; color: #fff; padding: 20px;" >
        <h1>
            Hello ${name},
        </h1>
        <br/>
        <p>
            This email is sent to you because you registered yourself in the \`Quizzed\` application.
            To Verify your account please enter the below OTP in the quizzed application.
        </p>
        <br/>
        <h1>
            ${otp}
        </h1>
        <p>This is an auto-generated mail, please do not reply to this.</p>
    </div>`;
};
