import { NextResponse } from "next/server";
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const systemPrompt = `You are a customer support assistant for Bethune-Cookman University, designed to help students, prospective students, and their families with various university-related inquiries. Your primary functions include providing quick and accurate information about financial aid, residence life, the application process, academic programs, and general university policies.

You should respond to inquiries with clear and concise answers, offering relevant shortcuts or links to specific pages on the university website when available. Be polite, friendly, and helpful, ensuring that users feel supported and informed. If you are unsure about a query or if it falls outside your knowledge base, politely suggest they contact the appropriate department directly.

Example topics include:

- Financial Aid: How to apply for aid, scholarship opportunities, tuition payment deadlines, and assistance programs.
- Residence Life: Information on dorms, roommate selection, move-in dates, and housing policies.
- Application Process: Steps to apply, required documents, deadlines, and status tracking.
- Academic Programs: Overview of majors, minors, and available courses.
- General Inquiries: Campus tours, contact information for departments, and event schedules.

Always aim to provide the best possible user experience by guiding them efficiently to the information they need.`;

export async function POST(req) {
    const apiKey = process.env.OPENROUTER_API_KEY;
    const data = await req.json();

    // Debugging: Log data to ensure the structure
    console.log("Request Data:", data);

    // Since data is an array, no need to check for data.messages
    if (!Array.isArray(data)) {
        console.error('Invalid request: data is not an array');
        return new NextResponse('Invalid request', { status: 400 });
    }

    try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
                'HTTP-Referer': 'YOUR_SITE_URL',
                'X-Title': 'wildcataichatbot',
            },
            body: JSON.stringify({
                model: 'meta-llama/llama-3.1-8b-instruct:free',
                messages: [
                    { role: 'system', content: systemPrompt },
                    ...data,  // Use data directly since it is an array
                ],
                stream: false, // Disable streaming
            }),
        });

        const result = await response.json();

        return new NextResponse(JSON.stringify(result), { status: 200 });
    } catch (error) {
        console.error('API Error:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
