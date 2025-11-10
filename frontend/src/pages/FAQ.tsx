import { motion } from 'framer-motion';
import { ArrowRight, HelpCircle, Package2, ShieldCheck, CreditCard, Truck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Link } from 'react-router-dom';

type FAQEntry = {
  id: string;
  question: string;
  answer: string;
  category: 'Orders' | 'Shipping' | 'Payments' | 'Account' | 'Returns';
};

const faqs: FAQEntry[] = [
  {
    id: 'track-order',
    category: 'Orders',
    question: 'How do I track my order?',
    answer:
      'Once your order ships, we will email you a tracking link. You can also visit the Track Order page and enter your order number and email to see the latest updates.',
  },
  {
    id: 'returns',
    category: 'Returns',
    question: 'What is your return policy?',
    answer:
      'Most items can be returned within 30 days of delivery as long as they are unused and in original packaging. Start a return from your QuickCart account or contact support for guidance.',
  },
  {
    id: 'international-shipping',
    category: 'Shipping',
    question: 'Do you offer international shipping?',
    answer:
      'Yes! We ship to 30+ countries. Shipping fees and delivery times vary by destination and are shown at checkout. Customs duties may apply depending on your region.',
  },
  {
    id: 'change-order',
    category: 'Orders',
    question: 'Can I change or cancel my order after placing it?',
    answer:
      'Orders can be modified or cancelled within 60 minutes. Head to your Orders page or contact support immediately with your order ID so we can assist.',
  },
  {
    id: 'payments',
    category: 'Payments',
    question: 'What payment methods do you accept?',
    answer:
      'We accept major credit and debit cards, PayPal, Apple Pay, Google Pay, and Klarna/Afterpay in eligible regions. All payments are processed securely.',
  },
  {
    id: 'damaged-item',
    category: 'Returns',
    question: 'My item arrived damaged, what should I do?',
    answer:
      'We are sorry! Please take photos of the packaging and product, then contact support within 48 hours so we can arrange a replacement or refund right away.',
  },
];

const categories = [
  {
    label: 'Orders & Tracking',
    description: 'Manage orders, updates, and adjustments.',
    icon: Package2,
    href: '/track-order',
  },
  {
    label: 'Shipping & Returns',
    description: 'Policies, timelines, and carrier info.',
    icon: Truck,
    href: '/shipping',
  },
  {
    label: 'Payments & Security',
    description: 'Accepted methods and billing help.',
    icon: CreditCard,
    href: '/privacy',
  },
];

export default function FAQ() {
  return (
    <div className="bg-gradient-to-b from-primary/5 via-background to-background">
      <div className="container mx-auto px-4 py-16 space-y-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto text-center space-y-4"
        >
          <Badge variant="secondary" className="px-3 py-1 gap-2">
            <HelpCircle className="h-4 w-4 text-primary" />
            Need quick answers?
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight">Frequently Asked Questions</h1>
          <p className="text-lg text-muted-foreground">
            Browse curated answers about shopping at QuickCart. If you don&apos;t find what you need, our support team is only one
            message away.
          </p>
        </motion.div>

        <div className="grid gap-10 lg:grid-cols-[2fr,1fr]">
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="space-y-6"
          >
            <Card className="border-none shadow-lg shadow-primary/5">
              <CardHeader>
                <CardTitle className="text-2xl">Top questions</CardTitle>
                <CardDescription>Tap a question to reveal the answer.</CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="multiple" className="space-y-4">
                  {faqs.map((faq) => (
                    <AccordionItem
                      key={faq.id}
                      value={faq.id}
                      className="rounded-xl border border-muted bg-card px-4 transition hover:border-primary/50"
                    >
                      <AccordionTrigger className="text-left text-base font-medium">
                        <div className="flex items-center gap-3">
                          <span className="inline-flex rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                            {faq.category}
                          </span>
                          <span>{faq.question}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <p className="text-muted-foreground leading-7">{faq.answer}</p>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="space-y-3">
                <CardTitle>Still need help?</CardTitle>
                <CardDescription>Our experts respond within 12 hours, every day.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap items-center gap-3">
                <Button asChild size="lg">
                  <Link to="/contact">
                    Contact support
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link to="/shipping">
                    Shipping updates
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </motion.section>

          <motion.aside
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="space-y-6"
          >
            <Card className="border-none bg-gradient-to-br from-primary via-primary/90 to-primary/70 text-primary-foreground">
                <CardContent className="space-y-6 py-8">
                <ShieldCheck className="h-10 w-10 text-white" />
                <div className="space-y-2">
                  <h3 className="text-2xl font-semibold">Shop with confidence</h3>
                  <p className="text-white/80 text-sm leading-6">
                    Every order is protected with buyer assurance and monitored logistics. We work with trusted carriers to guarantee
                    safe delivery worldwide.
                  </p>
                </div>
                  <div className="space-y-3 text-sm text-white/80">
                    <p>- 30-day hassle-free returns</p>
                    <p>- Real-time order notifications</p>
                    <p>- 24/7 payment fraud monitoring</p>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-4">
              {categories.map((category) => (
                <Card key={category.label} className="border border-muted/60 transition hover:border-primary/60">
                  <CardContent className="flex items-start gap-3 p-5">
                    <div className="rounded-full bg-primary/10 p-3 text-primary">
                      <category.icon className="h-5 w-5" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-semibold">{category.label}</h4>
                      <p className="text-sm text-muted-foreground">{category.description}</p>
                      <Button variant="link" asChild className="h-auto px-0 text-primary">
                        <Link to={category.href} className="inline-flex items-center gap-1 text-sm font-medium">
                          Explore
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.aside>
        </div>
      </div>
    </div>
  );
}

