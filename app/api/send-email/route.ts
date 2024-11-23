import { NextResponse } from 'next/server';
import { EmailService } from '@/lib/services/email';
import { NotificationType } from '@/lib/types/notification';

export async function POST(request: Request) {
  try {
    const { to, subject, text, html, type, data } = await request.json();

    // Validate request
    if (!to || (!type && (!subject || !text))) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // If template type is provided, use template
    let emailContent = { subject, text, html };
    if (type) {
      emailContent = EmailService.getSubscriptionTemplate(type as NotificationType, data);
    }

    // Send email
    const result = await EmailService.send(to, emailContent);

    return NextResponse.json({ 
      success: true, 
      messageId: result?.id 
    });
  } catch (error: any) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send email' },
      { status: 500 }
    );
  }
} 