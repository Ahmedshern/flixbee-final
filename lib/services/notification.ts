export async function sendExpirationNotification(email: string, duration: number) {
  try {
    // Send email notification
    await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: email,
        subject: 'Subscription Expired',
        text: `Your ${duration}-month subscription has expired. Please renew to continue accessing our services.`,
      }),
    });
  } catch (error) {
    console.error('Error sending notification:', error);
  }
} 