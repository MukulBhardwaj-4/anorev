import { generateText } from 'ai';
import { google } from '@ai-sdk/google';

export async function POST(request: Request) {
  try {
    const { reviews } = await request.json();

    if (!reviews || reviews.length === 0) {
      return Response.json(
        { error: 'No reviews provided' },
        { status: 400 }
      );
    }

    const reviewsText = reviews
      .map((review: string, index: number) => `Review ${index + 1}:\n${review}`)
      .join('\n\n---\n\n');

    const { text } = await generateText({
      model: google('gemini-2.5-flash'),
      prompt: `Summarize the following anonymous reviews in under 120 words.

Use this format:
**Overall:** one sentence on the general sentiment.
**Strengths:** up to 3 short bullet points.
**Improvements:** up to 3 short bullet points.

Only mention points that appear in the reviews. If there are only one or two reviews, keep it even shorter. Don't add a preamble or closing remarks.

Reviews:


${reviewsText}`,
    });

    return Response.json({ summary: text });
  } catch (error: any) {
    console.error('Summarization error:', error);
    return Response.json(
      { error: error.message || 'Failed to summarize reviews' },
      { status: 500 }
    );
  }
}
