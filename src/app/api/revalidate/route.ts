import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export async function POST(request: NextRequest) {
    try {
        const { id } = await request.json();

        if (!id) {
            return NextResponse.json({ error: 'Missing ID' }, { status: 400 });
        }

        revalidatePath(`/[locale]/pet/${id}`, 'page');

        return NextResponse.json({ revalidated: true, now: Date.now() });
    } catch (err) {
        return NextResponse.json({ revalidated: false, message: 'Error revalidating' }, { status: 500 });
    }
}