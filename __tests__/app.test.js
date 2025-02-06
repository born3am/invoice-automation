const { daemonPdfEmail } = require('../app');

jest.useFakeTimers();

describe('daemonPdfEmail', () => {
  it('should call sendEmail after 3000ms', () => {
    const sendEmail = jest.fn();
    global.sendEmail = sendEmail;

    daemonPdfEmail();

    expect(sendEmail).not.toHaveBeenCalled();

    jest.advanceTimersByTime(3000);

    expect(sendEmail).toHaveBeenCalled();
  });
});