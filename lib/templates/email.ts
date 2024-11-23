import { NotificationType, NotificationTemplate } from '../types/notification';

export const emailTemplates: Record<NotificationType, (data: any) => NotificationTemplate> = {
  subscription_expired: (data) => ({
    email: {
      subject: 'Your BuzzPlay Subscription Has Expired',
      text: `Your ${data.duration}-month subscription has expired. Please renew to continue accessing our services.`,
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2>Your BuzzPlay Subscription Has Expired</h2>
          <p>Your ${data.duration}-month subscription has expired.</p>
          <p>To continue enjoying unlimited movies and TV shows, please renew your subscription.</p>
          <a href="https://buzzplaymv.com/pricing" style="background-color: #22c55e; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            Renew Now
          </a>
        </div>
      `
    },
    telegram: `🔴 Your ${data.duration}-month BuzzPlay subscription has expired. Renew now to continue watching!`
  }),
  
  subscription_expiring_soon: (data) => ({
    email: {
      subject: 'Your BuzzPlay Subscription is Expiring Soon',
      text: `Your ${data.duration}-month subscription will expire in ${data.daysLeft} days. Renew now to avoid service interruption.`,
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2>Your BuzzPlay Subscription is Expiring Soon</h2>
          <p>Your subscription will expire in ${data.daysLeft} days.</p>
          <p>Renew now to ensure uninterrupted access to your favorite content.</p>
          <a href="https://buzzplaymv.com/pricing" style="background-color: #22c55e; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            Renew Now
          </a>
        </div>
      `
    },
    telegram: `⚠️ Your BuzzPlay subscription will expire in ${data.daysLeft} days. Renew now to keep watching!`
  }),

  subscription_activated: (data) => ({
    email: {
      subject: 'Welcome to BuzzPlay!',
      text: `Your ${data.duration}-month subscription has been activated. Enjoy watching!`,
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2>Welcome to BuzzPlay!</h2>
          <p>Your ${data.duration}-month subscription has been successfully activated.</p>
          <p>Start watching now and enjoy unlimited access to our content library.</p>
          <a href="https://buzzplaymv.com/" style="background-color: #22c55e; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            Start Watching
          </a>
        </div>
      `
    },
    telegram: `✅ Welcome to BuzzPlay! Your ${data.duration}-month subscription is now active. Enjoy watching!`
  }),

  payment_received: (data) => ({
    email: {
      subject: 'Payment Received - BuzzPlay',
      text: `We've received your payment of ${data.amount} for the ${data.duration}-month subscription.`,
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2>Payment Received</h2>
          <p>Thank you for your payment of ${data.amount}.</p>
          <p>Your subscription has been extended by ${data.duration} months.</p>
        </div>
      `
    },
    telegram: `💰 Payment received: ${data.amount} for ${data.duration}-month subscription. Thank you!`
  }),

  payment_failed: (data) => ({
    email: {
      subject: 'Payment Failed - BuzzPlay',
      text: `Your payment of ${data.amount} for the ${data.duration}-month subscription has failed.`,
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2>Payment Failed</h2>
          <p>Your payment of ${data.amount} could not be processed.</p>
          <p>Please try again or contact support if you need assistance.</p>
          <a href="https://buzzplaymv.com/dashboard" style="background-color: #22c55e; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            Retry Payment
          </a>
        </div>
      `
    },
    telegram: `❌ Payment failed: ${data.amount} for ${data.duration}-month subscription. Please check your payment method.`
  })
}; 