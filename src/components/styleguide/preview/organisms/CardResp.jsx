import React from "react";
import { motion } from 'framer-motion';
import TiltCard from '../../animation/TiltCard';
import { Button, Icon } from '@kol/ui';

/**
 * CardResp - Responsive hero card section
 * Centered layout with heading, description, email form, and tilt card
 */

const CardResp = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.1, 0.25, 1]
      }
    }
  };

  return (
    <section className="min-h-screen flex flex-col items-center justify-center text-center bg-surface-primary">
      <motion.div
        className="max-w-[1344px] mx-auto px-6 lg:px-12 py-24"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
      >
        {/* Heading */}
        <motion.h2 className="kol-heading-section mb-6" variants={itemVariants}>
          Develop a sleek & timeless brand identity
        </motion.h2>

        {/* Description */}
        <motion.p
          className="kol-mono-text font-light text-auto opacity-70 mb-12 mx-auto max-w-[42rem]"
          variants={itemVariants}
        >
          Visual language, defined by a set of foundational principles; from logo design and its usage in various formats, to typography selection and style definition, color system and the methodology behind brand palettes, to the guidelines which document and communicate these systems and concepts.
        </motion.p>

        {/* Email form */}
        <motion.form
          className="flex flex-row items-center justify-center gap-3 mb-16"
          variants={itemVariants}
        >
          <div className="relative flex-shrink-0">
            <span className="absolute flex items-center text-auto opacity-50 inset-y-0 left-6 pointer-events-none">
              <Icon name="foundation" size={20} />
            </span>
            <input
              type="email"
              placeholder="Your mail address"
              className="kol-mono-text rounded-full border text-auto placeholder:text-auto placeholder:opacity-50 focus:outline-none focus:ring-2 focus:ring-accent-primary uppercase"
              style={{
                borderColor: 'var(--kol-border-default)',
                backgroundColor: 'var(--kol-surface-secondary)',
                width: '380px',
                paddingTop: '14px',
                paddingBottom: '14px',
                paddingLeft: '52px',
                paddingRight: '24px'
              }}
            />
          </div>
          <Button type="submit" variant="primary">
            Get Started
          </Button>
        </motion.form>

        {/* Tilt card */}
        <motion.div className="mx-auto max-w-[32rem]" variants={itemVariants}>
          <TiltCard
            src="/img/Kolk-img/trollatunga-3.png"
            alt="Dashboard card preview"
            className="w-full aspect-[4/5] rounded-3xl overflow-hidden"
          />
        </motion.div>
      </motion.div>
    </section>
  );
}

export default CardResp
