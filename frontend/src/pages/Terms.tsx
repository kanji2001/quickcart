import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldCheck, Gavel, UserCheck, RefreshCcw } from 'lucide-react';

const terms = [
  {
    title: 'Acceptance of Terms',
    description:
      'By accessing or using QuickCart, you agree to these Terms of Service and our Privacy Policy. If you disagree with any part, please discontinue use immediately.',
    icon: ShieldCheck,
  },
  {
    title: 'Account Responsibilities',
    description:
      'Keep your login credentials safe and notify us right away of any unauthorized activity. You are responsible for all actions taken through your account.',
    icon: UserCheck,
  },
  {
    title: 'Purchases & Pricing',
    description:
      'Orders are subject to availability and price confirmation. We may cancel orders if we detect suspicious activity or pricing errors.',
    icon: Gavel,
  },
  {
    title: 'Service Updates',
    description:
      'We continuously enhance QuickCart. Features may change or be discontinued, and we reserve the right to update these Terms when necessary.',
    icon: RefreshCcw,
  },
];

export default function Terms() {
  return (
    <div className="bg-gradient-to-b from-primary/5 via-background to-background">
      <div className="container mx-auto px-4 py-16 space-y-12">
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto text-center space-y-4"
        >
          <Badge variant="secondary" className="px-3 py-1">
            Updated November 2025
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight">Terms of Service</h1>
          <p className="text-muted-foreground text-lg">
            These terms outline how to use QuickCart responsibly. Please review them carefully; accessing the platform means you agree to
            the guidelines below.
          </p>
        </motion.section>

        <div className="grid gap-6 md:grid-cols-2">
          {terms.map((term, index) => (
            <motion.div
              key={term.title}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
            >
              <Card className="h-full border border-muted/60">
                <CardHeader className="space-y-3">
                  <div className="inline-flex rounded-full bg-primary/10 p-3 text-primary">
                    <term.icon className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-xl">{term.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-7 text-muted-foreground">{term.description}</CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <Card className="max-w-4xl mx-auto border border-dashed border-primary/40 bg-primary/5">
          <CardHeader>
            <CardTitle>Questions about these terms?</CardTitle>
            <CardDescription>
              Reach out to <span className="text-primary font-medium">legal@quickcart.com</span> and we&apos;ll walk you through any part of
              the agreement.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}

