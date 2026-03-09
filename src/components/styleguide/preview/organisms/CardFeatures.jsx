import { Button, SectionLabel } from '@kol/ui/atoms'
import CardFeatureItem from '../molecules/CardFeatureItem'

const CardFeatures = ({
  title = 'Selected Work',
  description = 'Develop a sleek and timeless brand identity, with a story that reflects your values, a message that aligns with your audience, and a strategy to operate tailored fitted to the core of your brand.',
  features = [],
  actions = []
}) => {
  return (
    <section className="w-full bg-auto">
      <div className="w-full p-6 md:p-8 bg-opacity-hex-02 rounded border border-auto flex flex-col gap-8 md:gap-10">

        {/* Header */}
        <div className="w-full pt-[224px]">
          <SectionLabel text={title} />
          <p className="kol-mono-sm text-auto opacity-60 mt-3 text-[12px] w-[30%]">
            {description}
          </p>
        </div>

        {/* Features Grid */}
        <div className="self-stretch inline-flex flex-col md:flex-row md:h-72 justify-start items-center gap-6">
          {features.map((feature, index) => (
            <CardFeatureItem
              key={index}
              title={feature.title}
              icon={feature.icon}
              visual={feature.visual}
              description={feature.description}
            />
          ))}
        </div>

        {/* Actions */}
        {actions.length > 0 && (
          <div className="flex flex-wrap gap-4 justify-center pt-10 pb-4">
            {actions.map((action, index) => (
              <Button
                key={index}
                variant={action.variant === 'primary' ? 'secondary' : 'outline'}
                onClick={action.onClick}
              >
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default CardFeatures
