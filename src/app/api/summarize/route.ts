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
      prompt: `Please provide a concise and comprehensive summary of the following reviews.

Highlight the key themes, most common feedback, strengths, and areas for improvement.
Format the summary in a clear, readable way with sections for:
- Overall Sentiment
- Key Strengths
- Areas for Improvement
- Common Themes
- Recommendations

Here are the reviews:

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
