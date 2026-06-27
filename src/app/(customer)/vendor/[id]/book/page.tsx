'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { format, addDays } from 'date-fns';

export default function BookingFlow({ params }: { params: { id: string } }) {
  const router = useRouter();
  const vendorId = params.id;
  const [step, setStep] = useState<'service' | 'date' | 'payment' | 'confirmation'>('service');
  const [services, setServices] = useState<any[]>([]);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);

  useEffect(() => {
    // Fetch vendor's services
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const res = await fetch(`/api/vendors/${vendorId}/services`);
      const data = await res.json();
      setServices(data.services || []);
    } catch (error) {
      console.error(error);
    }
  };

  const handlePayment = async () => {
    if (!selectedService || !selectedDate || !selectedTime) return;

    setLoading(true);
    try {
      const res = await fetch('/api/payments/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vendorId,
          serviceId: selectedService.id,
          scheduled_time: new Date(selectedDate.toDateString() + ' ' + selectedTime),
          price: selectedService.base_price,
        }),
      });

      const { sessionUrl } = await res.json();
      window.location.href = sessionUrl;
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const availableDates = Array.from({ length: 28 }, (_, i) => addDays(new Date(), i + 1));
  const availableTimes = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'];

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {step === 'service' && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Select a service</h2>
          <div className="space-y-3">
            {services.map((service) => (
              <Card
                key={service.id}
                className="p-4 cursor-pointer hover:border-blue-500"
                onClick={() => {
                  setSelectedService(service);
                  setStep('date');
                }}
              >
                <h3 className="font-bold">{service.name}</h3>
                <p className="text-sm text-gray-600">{service.duration_minutes} mins</p>
                <p className="text-lg font-bold mt-2">£{service.base_price}</p>
              </Card>
            ))}
          </div>
        </div>
      )}

      {step === 'date' && selectedService && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Select date & time</h2>
          <div className="mb-6">
            <h3 className="font-semibold mb-2">Date</h3>
            <div className="grid grid-cols-4 gap-2">
              {availableDates.map((date) => (
                <button
                  key={date.toISOString()}
                  onClick={() => setSelectedDate(date)}
                  className={`p-3 rounded text-sm ${
                    selectedDate?.toDateString() === date.toDateString()
                      ? 'bg-blue-500 text-white'
                      : 'bg-white border'
                  }`}
                >
                  {format(date, 'd')} {format(date, 'EEE')}
                </button>
              ))}
            </div>
          </div>

          {selectedDate && (
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Time</h3>
              <div className="grid grid-cols-3 gap-2">
                {availableTimes.map((time) => (
                  <button
                    key={time}
                    onClick={() => setSelectedTime(time)}
                    className={`p-3 rounded ${
                      selectedTime === time
                        ? 'bg-blue-500 text-white'
                        : 'bg-white border'
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>
          )}

          <Button
            className="w-full"
            onClick={() => setStep('payment')}
            disabled={!selectedTime}
          >
            Continue to Payment
          </Button>
          <Button
            variant="outline"
            className="w-full mt-2"
            onClick={() => setStep('service')}
          >
            Back
          </Button>
        </div>
      )}

      {step === 'payment' && selectedService && selectedDate && selectedTime && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Review booking</h2>
          <Card className="p-4 mb-6">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Service:</span>
                <span className="font-semibold">{selectedService.name}</span>
              </div>
              <div className="flex justify-between">
                <span>Date & Time:</span>
                <span className="font-semibold">
                  {format(selectedDate, 'MMM d')} at {selectedTime}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Duration:</span>
                <span className="font-semibold">{selectedService.duration_minutes} mins</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-bold">
                <span>Total:</span>
                <span>£{selectedService.base_price}</span>
              </div>
            </div>
          </Card>

          <Button className="w-full" onClick={handlePayment} disabled={loading}>
            {loading ? 'Processing...' : 'Pay Now'}
          </Button>
        </div>
      )}
    </div>
  );
}
