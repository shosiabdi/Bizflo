import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
})

export async function POST(req: Request) {
  try {
    const { description, type } = await req.json()

    const prompts: Record<string, string> = {
      linkedin: `You are a world class SaaS marketing expert. Based on this SaaS product description, write 3 high converting LinkedIn posts. Each post must follow the AIDA formula (Attention, Interest, Desire, Action). Include relevant hashtags at the end of each post. Make them personal, story-driven and authentic. Never sound like an ad.

Product description: ${description}

Format your response exactly like this for each post:
POST 1:
[post content with hashtags]

POST 2:
[post content with hashtags]

POST 3:
[post content with hashtags]`,

      reddit: `You are a world class SaaS marketing expert. Based on this SaaS product description, write 2 Reddit posts for r/SaaS and r/startups. Reddit hates ads — make them genuine, ask for feedback, tell a real story. Include a title and body for each.

Product description: ${description}

Format exactly like this:
POST 1 — r/SaaS:
Title: [title]
Body: [body]

POST 2 — r/startups:
Title: [title]
Body: [body]`,

      facebook: `You are a world class SaaS marketing expert. Based on this SaaS product description, write 3 Facebook group posts. One should be a story post, one a problem post, and one an engagement post that asks a question to get comments. Include hashtags.

Product description: ${description}

Format exactly like this:
POST 1 — Story:
[content]

POST 2 — Problem:
[content]

POST 3 — Engagement:
[content]`,

      twitter: `You are a world class SaaS marketing expert. Based on this SaaS product description, write 5 tweets. Make them punchy, under 280 characters each. Mix hooks, problems, and social proof angles. Include hashtags.

Product description: ${description}

Format exactly like this:
TWEET 1:
[content]

TWEET 2:
[content]

TWEET 3:
[content]

TWEET 4:
[content]

TWEET 5:
[content]`,

      dms: `You are a world class SaaS marketing expert. Based on this SaaS product description, write complete DM sequences for LinkedIn, Twitter/X warm leads, and cold email. Each sequence should have 2-3 messages. Never pitch in the first message.

Product description: ${description}

Format exactly like this:
LINKEDIN SEQUENCE:
Message 1 — Opener:
[content]

Message 2 — Pitch:
[content]

Message 3 — Close:
[content]

TWITTER/X WARM LEADS:
Step 1 — Search terms:
[list of search terms to find warm leads]

Step 2 — DM:
[content]

COLD EMAIL:
Email 1 — Subject: [subject]
[content]

Email 2 — Follow up subject: [subject]
[content]`,

      ads: `You are a world class SaaS marketing expert. Based on this SaaS product description, write high converting ad copy for Facebook/Instagram and LinkedIn. Include targeting recommendations for each platform.

Product description: ${description}

Format exactly like this:
FACEBOOK & INSTAGRAM:
Targeting:
[targeting details]

Ad Copy 1 — Hook format:
[content]

Ad Copy 2 — Problem format:
[content]

LINKEDIN:
Targeting:
[targeting details]

Ad Copy:
[content]

RETARGETING AD:
[content]`,

      playbook: `You are a world class SaaS marketing expert. Based on this SaaS product description, create a complete 3-phase growth playbook. Phase 1 is 0-10 customers, Phase 2 is 10-100, Phase 3 is 100-1000. Be very specific to this product — mention the exact type of customer, exact communities, exact strategies that would work for THIS product specifically.

Product description: ${description}

Format exactly like this:
PHASE 1 — 0 to 10 customers:
Strategy 1: [title]
[detailed explanation]

Strategy 2: [title]
[detailed explanation]

Strategy 3: [title]
[detailed explanation]

PHASE 2 — 10 to 100 customers:
Strategy 1: [title]
[detailed explanation]

Strategy 2: [title]
[detailed explanation]

Strategy 3: [title]
[detailed explanation]

PHASE 3 — 100 to 1,000 customers:
Strategy 1: [title]
[detailed explanation]

Strategy 2: [title]
[detailed explanation]

Strategy 3: [title]
[detailed explanation]`
    }

    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 800,
      messages: [
        { role: 'user', content: prompts[type] }
      ]
    })

    const content = message.content[0]
    if (content.type === 'text') {
      return NextResponse.json({ result: content.text })
    }

    return NextResponse.json({ error: 'No response' }, { status: 500 })

  } catch (error: any) {
    console.error('Generate error:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}