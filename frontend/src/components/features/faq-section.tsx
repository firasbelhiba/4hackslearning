'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqs = [
  {
    question: 'Is 4hacks Education free?',
    answer: 'We offer both free and premium courses. Many foundational courses are completely free, while advanced certifications may require a one-time payment.',
  },
  {
    question: 'Do I need prior experience to start?',
    answer: 'Not at all! We have courses for all skill levels, from complete beginners to advanced developers. Each course clearly indicates the required prerequisites.',
  },
  {
    question: 'How are the courses different from traditional online courses?',
    answer: 'Our courses are specifically designed around hackathon challenges and real-world Web3 projects. You learn by building, not just watching.',
  },
  {
    question: 'What kind of certifications do you offer?',
    answer: 'We offer skill-based certifications in various Web3 technologies including DeFi, smart contracts, blockchain development, and more. Each certification validates practical skills through hands-on assessments.',
  },
  {
    question: 'Are the certifications recognized?',
    answer: 'Yes! Our certifications are recognized by hackathon organizers and Web3 companies. They appear on your 4hacks profile and can be verified by anyone using our verification system.',
  },
];

export function FAQSection() {
  return (
    <section className="py-16 lg:py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 font-display">
              Frequently Asked Questions
            </h2>
            <p className="text-gray-600">
              Everything you need to know about getting started
            </p>
          </div>

          {/* FAQ Accordion */}
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left font-medium">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-600">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
