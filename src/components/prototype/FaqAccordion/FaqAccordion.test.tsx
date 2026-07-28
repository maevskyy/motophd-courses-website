import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { FaqAccordion } from './FaqAccordion';

const items = [
  { answer: 'Answer one', question: 'Question one' },
  { answer: 'Answer two', question: 'Question two' }
];

describe('FaqAccordion', () => {
  it('renders every question and answer', () => {
    render(<FaqAccordion items={items} />);

    expect(screen.getByText('Question one')).toBeInTheDocument();
    expect(screen.getByText('Question two')).toBeInTheDocument();
    expect(screen.getByText('Answer one')).toBeInTheDocument();
    expect(screen.getByText('Answer two')).toBeInTheDocument();
  });

  it('opens an item on click and closes it on the second click', async () => {
    const user = userEvent.setup();
    render(<FaqAccordion items={items} />);

    const question = screen.getByRole('button', { name: /question one/i });
    const item = question.closest('.faqItem');

    expect(item).not.toHaveClass('faqItemOpen');

    await user.click(question);
    expect(item).toHaveClass('faqItemOpen');

    await user.click(question);
    expect(item).not.toHaveClass('faqItemOpen');
  });

  it('toggles items independently of each other', async () => {
    const user = userEvent.setup();
    render(<FaqAccordion items={items} />);

    await user.click(screen.getByRole('button', { name: /question one/i }));

    const first = screen.getByText('Question one').closest('.faqItem');
    const second = screen.getByText('Question two').closest('.faqItem');

    expect(first).toHaveClass('faqItemOpen');
    expect(second).not.toHaveClass('faqItemOpen');
  });
});
