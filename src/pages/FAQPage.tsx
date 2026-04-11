import { useState } from 'react';
import { ChevronDownIcon } from 'lucide-react';
import { useDocumentHead } from '../hooks/useDocumentHead';
import { Link } from 'react-router-dom';

const faqs = [
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept UPI, credit cards, debit cards, and net banking through our secure payment partner Razorpay.',
  },
  {
    question: 'How long does shipping take?',
    answer: 'Orders are dispatched within 2-3 business days. Delivery typically takes 5-7 business days depending on your location. We offer complimentary express shipping on all orders across India.',
  },
  {
    question: 'What is your return policy?',
    answer: 'We accept returns within 14 days of delivery. Items must be unworn, unwashed, with all tags attached and in original packaging. Refunds are processed within 7-10 business days.',
  },
  {
    question: 'How do I track my order?',
    answer: 'Once your order ships, you will receive a tracking number via email. You can also track your order from the My Orders page in your account.',
  },
  {
    question: 'Do you ship internationally?',
    answer: 'Currently, we ship within India only. We are working on expanding to international markets soon.',
  },
  {
    question: 'How do I choose the right size?',
    answer: 'Each product page includes a Size Guide button with detailed measurements. We recommend measuring yourself and comparing with our size chart for the best fit.',
  },
  {
    question: 'Can I cancel my order?',
    answer: 'Orders can be cancelled before they are dispatched. Please contact us at support@vppafashions.com or call +91 90716 91999 as soon as possible.',
  },
  {
    question: 'Are the product colours accurate?',
    answer: 'We make every effort to display accurate colours. However, actual colours may vary slightly due to screen settings and lighting conditions during photography.',
  },
];

export function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  useDocumentHead({
    title: 'FAQ | VPPA Fashions',
    description: 'Frequently asked questions about VPPA Fashions. Find answers about shipping, returns, payments, sizing, and more.',
    canonical: 'https://vppafashions.com/faq',
  });

  return (
    <main className="bg-background">
      <section className="py-20 md:py-32 px-4">
        <div className="container mx-auto max-w-4xl">
          <h1 className="font-magazine italic text-5xl md:text-7xl mb-12 font-light text-center">FAQ</h1>
          <p className="text-center text-muted-foreground mb-16 max-w-2xl mx-auto">
            Find answers to commonly asked questions. If you need further assistance, please <Link to="/contact" className="text-primary hover:text-foreground transition-colors">contact us</Link>.
          </p>

          <div className="border-t border-border/50">
            {faqs.map((faq, index) => (
              <div key={index} className="border-b border-border/50">
                <button
                  className="w-full py-6 flex justify-between items-center text-left gap-4"
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                >
                  <h2 className="text-base font-medium text-foreground">{faq.question}</h2>
                  <ChevronDownIcon
                    className={`w-5 h-5 flex-shrink-0 text-muted-foreground transition-transform ${openIndex === index ? 'rotate-180' : ''}`}
                  />
                </button>
                {openIndex === index && (
                  <div className="pb-6 text-muted-foreground leading-relaxed">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <Link to="/" className="text-sm uppercase tracking-widest text-primary hover:text-foreground transition-colors">
              Back to Home
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
