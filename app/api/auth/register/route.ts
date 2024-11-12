import { NextResponse } from 'next/server';
import { EmbyService } from '@/lib/services/emby';
import { headers } from 'next/headers';

export async function POST(request: Request) {
    try {
        // Add CORS headers
        const headersList = await headers();
        const origin = headersList.get('origin') || '*';

        // Parse request body
        let body;
        try {
            body = await request.json();
        } catch (e) {
            return new NextResponse(
                JSON.stringify({ error: 'Invalid JSON payload' }),
                {
                    status: 400,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': origin,
                        'Access-Control-Allow-Methods': 'POST, OPTIONS',
                        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                    },
                }
            );
        }

        const { email, password } = body;

        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email and password are required' },
                {
                    status: 400,
                    headers: {
                        'Access-Control-Allow-Origin': origin,
                        'Access-Control-Allow-Methods': 'POST, OPTIONS',
                        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                    },
                }
            );
        }

        const embyUser = await EmbyService.createUser(email, password);

        return NextResponse.json(embyUser, {
            headers: {
                'Access-Control-Allow-Origin': origin,
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            },
        });
    } catch (error: any) {
        console.error('Registration error:', error);
        return NextResponse.json(
            {
                error: 'Failed to create streaming account',
                details: error.message
            },
            {
                status: 500,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'POST, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                },
            }
        );
    }
}

export async function OPTIONS(request: Request) {
    return new NextResponse(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
    });
}