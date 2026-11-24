const inbox = 'effminusmedia@gmail.com';
const sender = 'inquiries@notify.effminusmedia.com';

const allowedOrigins = new Set(['https://effminusmedia.com', 'https://www.effminusmedia.com']);

function responseFor(origin, message, status = 200) {
  const headers = { 'Cache-Control': 'no-store', Vary: 'Origin' };
  if (allowedOrigins.has(origin)) headers['Access-Control-Allow-Origin'] = origin;
  return Response.json({ message }, {
    status,
    headers,
  });
}

function validDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(value);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin');
    const respond = (message, status) => responseFor(origin, message, status);
    if (url.pathname !== '/api/inquiry') return respond('Page unavailable.', 404);
    if (request.method !== 'POST') return respond('Use the inquiry form to submit a project.', 405);
    if (!allowedOrigins.has(origin)) return respond('Open the inquiry page to submit the form.', 403);
    if (request.headers.get('Content-Type')?.split(';')[0] !== 'application/x-www-form-urlencoded') {
      return respond('Use the inquiry form to submit a project.', 415);
    }

    const body = await request.text();
    if (body.length > 40000) return respond('Please shorten your project description.', 413);
    const form = new URLSearchParams(body);
    const field = name => (form.get(name) ?? '').trim();
    if (field('website')) return respond('Inquiry sent. Thanks for reaching out.');

    if (field('communicationsConsent') !== 'yes') {
      return respond('Please agree to receive communications from Eff Minus LLC.', 400);
    }

    const first = field('First name');
    const last = field('Last name');
    const phone = field('Phone number');
    const email = field('email');
    const description = field('Project description');
    const start = field('Start date');
    const end = field('End date');

    if (!first || first.length > 100 || !last || last.length > 100 ||
        !phone || phone.length > 50 || email.length > 254 ||
        !/^[^\s@<>,;]+@[^\s@<>,;]+\.[^\s@<>,;]+$/.test(email) ||
        !description || description.length > 3000) {
      return respond('Check your contact details and project description, then try again.', 400);
    }

    if ((start && !validDate(start)) || (end && (!start || !validDate(end) || end < start))) {
      return respond('Check your project dates and make sure the end date is on or after the start date.', 400);
    }

    try {
      const ip = request.headers.get('CF-Connecting-IP') ?? 'unknown';
      const { success } = await env.INQUIRY_LIMIT.limit({ key: ip });
      if (!success) return respond('Too many attempts. Wait a minute, then try again.', 429);

      await env.INQUIRY_EMAIL.send({
        from: sender,
        to: inbox,
        replyTo: email,
        subject: 'New Eff Minus Media project inquiry',
        text: [
          `Name: ${first} ${last}`,
          `Phone: ${phone}`,
          `Email: ${email}`,
          `Project timing: ${end ? `${start} to ${end}` : start || 'Flexible'}`,
          '',
          'Communications consent: Yes',
          '',
          'Project description',
          description,
        ].join('\n'),
      });
      return respond('Inquiry sent. Thanks for reaching out.');
    } catch {
      return respond('Your inquiry could not be sent. Try again or email effminusmedia@gmail.com directly.', 503);
    }
  },
};
