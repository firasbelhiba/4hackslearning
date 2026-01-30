'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const audiences = [
  { label: 'Hackers', initialX: -280, initialY: -30, rotation: -12 },
  { label: 'Professionals', initialX: -100, initialY: -60, rotation: 5 },
  { label: 'Students', initialX: 100, initialY: -50, rotation: 8 },
  { label: 'Career switchers', initialX: 280, initialY: -20, rotation: -8 },
  { label: 'Hackathon organizers', initialX: 0, initialY: 50, rotation: 3 },
];

interface PhysicsState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  angularVelocity: number;
}

function DraggableTicket({
  label,
  initialX,
  initialY,
  initialRotation,
  sectionRef,
}: {
  label: string;
  initialX: number;
  initialY: number;
  initialRotation: number;
  sectionRef: React.RefObject<HTMLDivElement>;
}) {
  const ticketRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [hasBeenDragged, setHasBeenDragged] = useState(false);
  const [physics, setPhysics] = useState<PhysicsState>({
    x: initialX,
    y: initialY,
    vx: 0,
    vy: 0,
    rotation: initialRotation,
    angularVelocity: 0,
  });
  const dragStart = useRef({ x: 0, y: 0 });
  const lastMouse = useRef({ x: 0, y: 0, time: 0 });

  // Get section bounds - use the entire section as collision area
  const getBounds = useCallback(() => {
    if (!sectionRef.current || !ticketRef.current) {
      return { minX: -500, maxX: 500, minY: -200, maxY: 200 };
    }
    const section = sectionRef.current.getBoundingClientRect();
    const ticket = ticketRef.current.getBoundingClientRect();
    const halfWidth = ticket.width / 2;
    const halfHeight = ticket.height / 2;
    return {
      minX: -section.width / 2 + halfWidth + 40,
      maxX: section.width / 2 - halfWidth - 40,
      minY: -section.height / 2 + halfHeight + 40,
      maxY: section.height / 2 - halfHeight - 40,
    };
  }, [sectionRef]);

  useEffect(() => {
    if (isDragging) return;

    let animationId: number;
    const friction = 0.995; // Very low friction for space-like floating
    const angularFriction = 0.99;
    const bounceDamping = 0.7; // Energy retained after bounce

    const animate = () => {
      setPhysics((prev) => {
        const bounds = getBounds();

        let newVx = prev.vx * friction;
        let newVy = prev.vy * friction;
        let newAngularVelocity = prev.angularVelocity * angularFriction;

        let newX = prev.x + newVx;
        let newY = prev.y + newVy;
        let newRotation = prev.rotation + newAngularVelocity;

        // Bounce off walls
        if (newX <= bounds.minX) {
          newX = bounds.minX;
          newVx = Math.abs(newVx) * bounceDamping;
          newAngularVelocity += newVy * 0.02; // Add spin on bounce
        } else if (newX >= bounds.maxX) {
          newX = bounds.maxX;
          newVx = -Math.abs(newVx) * bounceDamping;
          newAngularVelocity -= newVy * 0.02;
        }

        if (newY <= bounds.minY) {
          newY = bounds.minY;
          newVy = Math.abs(newVy) * bounceDamping;
          newAngularVelocity += newVx * 0.02;
        } else if (newY >= bounds.maxY) {
          newY = bounds.maxY;
          newVy = -Math.abs(newVy) * bounceDamping;
          newAngularVelocity -= newVx * 0.02;
        }

        // Keep rotation in reasonable range
        if (newRotation > 360) newRotation -= 360;
        if (newRotation < -360) newRotation += 360;

        return {
          x: newX,
          y: newY,
          vx: newVx,
          vy: newVy,
          rotation: newRotation,
          angularVelocity: newAngularVelocity,
        };
      });

      animationId = requestAnimationFrame(animate);
    };

    if (hasBeenDragged) {
      animationId = requestAnimationFrame(animate);
    }

    return () => cancelAnimationFrame(animationId);
  }, [isDragging, hasBeenDragged, getBounds]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setHasBeenDragged(true);
    dragStart.current = {
      x: e.clientX - physics.x,
      y: e.clientY - physics.y,
    };
    lastMouse.current = { x: e.clientX, y: e.clientY, time: Date.now() };
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;

    const newX = e.clientX - dragStart.current.x;
    const newY = e.clientY - dragStart.current.y;

    // Calculate velocity based on mouse movement
    const now = Date.now();
    const dt = Math.max(now - lastMouse.current.time, 1);
    const vx = ((e.clientX - lastMouse.current.x) / dt) * 20;
    const vy = ((e.clientY - lastMouse.current.y) / dt) * 20;

    // Add rotation based on horizontal velocity
    const angularVelocity = vx * 0.15;

    lastMouse.current = { x: e.clientX, y: e.clientY, time: now };

    setPhysics((prev) => ({
      ...prev,
      x: newX,
      y: newY,
      vx,
      vy,
      angularVelocity,
    }));
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setIsDragging(true);
    setHasBeenDragged(true);
    dragStart.current = {
      x: touch.clientX - physics.x,
      y: touch.clientY - physics.y,
    };
    lastMouse.current = { x: touch.clientX, y: touch.clientY, time: Date.now() };
  };

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isDragging) return;
    const touch = e.touches[0];

    const newX = touch.clientX - dragStart.current.x;
    const newY = touch.clientY - dragStart.current.y;

    const now = Date.now();
    const dt = Math.max(now - lastMouse.current.time, 1);
    const vx = ((touch.clientX - lastMouse.current.x) / dt) * 20;
    const vy = ((touch.clientY - lastMouse.current.y) / dt) * 20;
    const angularVelocity = vx * 0.15;

    lastMouse.current = { x: touch.clientX, y: touch.clientY, time: now };

    setPhysics((prev) => ({
      ...prev,
      x: newX,
      y: newY,
      vx,
      vy,
      angularVelocity,
    }));
  }, [isDragging]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleTouchEnd);
      return () => {
        window.removeEventListener('touchmove', handleTouchMove);
        window.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [isDragging, handleTouchMove, handleTouchEnd]);

  return (
    <div
      ref={ticketRef}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      className={`absolute px-6 py-3 bg-white border-2 border-black rounded-lg font-medium select-none ${
        isDragging ? 'cursor-grabbing z-50' : 'cursor-grab'
      }`}
      style={{
        transform: `translate(calc(-50% + ${physics.x}px), calc(-50% + ${physics.y}px)) rotate(${physics.rotation}deg)`,
        left: '50%',
        top: '50%',
        transition: isDragging ? 'none' : 'box-shadow 0.2s',
        boxShadow: isDragging
          ? '8px 8px 0px 0px rgba(0,0,0,1)'
          : '4px 4px 0px 0px rgba(0,0,0,1)',
      }}
    >
      {label}
    </div>
  );
}

export function AudienceSection() {
  const sectionRef = useRef<HTMLDivElement>(null);

  return (
    <section ref={sectionRef} className="py-16 lg:py-24 bg-pink-200 grid-bg overflow-hidden relative">
      {/* Draggable tickets - positioned relative to section */}
      {audiences.map((audience, index) => (
        <DraggableTicket
          key={index}
          label={audience.label}
          initialX={audience.initialX}
          initialY={audience.initialY}
          initialRotation={audience.rotation}
          sectionRef={sectionRef}
        />
      ))}

      <div className="container mx-auto px-4 relative z-10 pointer-events-none">
        <div className="max-w-4xl mx-auto text-center">
          {/* Section Header */}
          <h2 className="text-3xl md:text-4xl font-bold mb-8 font-display">
            Who is this for?
          </h2>

          {/* Spacer for tickets */}
          <div className="h-[200px] md:h-[250px] mb-8" />

          {/* CTA Button */}
          <Link href="/courses" className="pointer-events-auto inline-block">
            <Button variant="secondary" size="lg">
              Start Learning
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
