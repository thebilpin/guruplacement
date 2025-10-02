import { NextRequest, NextResponse } from 'next/server'
import { collections } from '@/lib/db'

export async function GET() {
  try {
    const [statsSnapshot, featuresSnapshot, testimonialsSnapshot, faqsSnapshot] = await Promise.all([
      collections.statistics().get(),
      collections.features().get(),
      collections.testimonials().get(),
      collections.faqItems().get(),
    ]);

    const cmsData = {
      statistics: statsSnapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() })),
      features: featuresSnapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() })),
      testimonials: testimonialsSnapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() })),
      faqs: faqsSnapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() })),
    };

    return NextResponse.json(cmsData);
  } catch (error) {
    console.error('Error fetching CMS data:', error);
    return NextResponse.json({ error: 'Failed to fetch CMS data' }, { status: 500 });
  }
}