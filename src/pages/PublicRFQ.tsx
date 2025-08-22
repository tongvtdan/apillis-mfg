import { RFQIntakePortal } from "@/components/rfq/RFQIntakePortal";

export default function PublicRFQ() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30">
      <div className="container mx-auto py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mb-6">
            <h1 className="text-4xl font-bold text-primary mb-2">Manufacturing RFQ Portal</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Get competitive quotes for your manufacturing projects from our expert team
            </p>
          </div>
          
          {/* Trust indicators */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-8">
            <div className="text-center p-4">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl font-bold text-primary">24h</span>
              </div>
              <h3 className="font-semibold mb-1">Fast Response</h3>
              <p className="text-sm text-muted-foreground">Quote within 24 hours</p>
            </div>
            
            <div className="text-center p-4">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl font-bold text-primary">ISO</span>
              </div>
              <h3 className="font-semibold mb-1">Quality Certified</h3>
              <p className="text-sm text-muted-foreground">ISO 9001:2015 certified</p>
            </div>
            
            <div className="text-center p-4">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl font-bold text-primary">500+</span>
              </div>
              <h3 className="font-semibold mb-1">Completed Projects</h3>
              <p className="text-sm text-muted-foreground">Trusted by industry leaders</p>
            </div>
          </div>
        </div>

        {/* RFQ Form */}
        <RFQIntakePortal onSuccess={(rfqNumber) => {
          console.log('RFQ submitted:', rfqNumber);
        }} />

        {/* Footer */}
        <div className="text-center mt-12 py-8 border-t">
          <p className="text-muted-foreground text-sm">
            Need help with your submission? Contact us at{' '}
            <a href="mailto:rfq@company.com" className="text-primary hover:underline">
              rfq@company.com
            </a>
            {' '}or call{' '}
            <a href="tel:+1-555-123-4567" className="text-primary hover:underline">
              +1 (555) 123-4567
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}