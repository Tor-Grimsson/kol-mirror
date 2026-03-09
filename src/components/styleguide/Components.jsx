import React from 'react'
// Atoms
import Button from '../atoms/Button'
import Checkbox from '../atoms/Checkbox'
import Input from '../atoms/Input'
import Slider from '../atoms/Slider'
import ToggleCheckbox from '../atoms/ToggleCheckbox'
import ToggleSwitch from '../atoms/ToggleSwitch'
// Molecules
import Badge from '../molecules/Badge'
import ButtonNav from '../molecules/ButtonNav'
import Dropdown from '../molecules/Dropdown'
import DropdownTagFilter from '../molecules/DropdownTagFilter'
import Pill from '../molecules/Pill'
import QuantityInput from '../molecules/QuantityInput'
import QuantityStepper from '../molecules/QuantityStepper'
import SectionLabel from '../molecules/SectionLabel'
import Tag from '../molecules/Tag'
import ToggleBracket from '../molecules/ToggleBracket'
import UnitSelector from '../molecules/UnitSelector'
import ViewToggle from '../molecules/ViewToggle'
import ThemeToggleButton from '../molecules/ThemeToggleButton'
// Icons
import Icon from '../icons/Icon'

function ComponentShowcase({ name, description, children }) {
  return (
    <div className="border border-fg-08 rounded-md p-6 mb-6">
      <div className="mb-4">
        <h4 className="text-lg font-semibold mb-1">{name}</h4>
        {description && <p className="text-sm text-fg-64">{description}</p>}
      </div>
      <div className="space-y-6">{children}</div>
    </div>
  )
}

function VariantGroup({ label, children }) {
  return (
    <div>
      <p className="text-xs font-medium text-fg-48 mb-3 uppercase tracking-wider">{label}</p>
      <div className="flex flex-wrap gap-3 items-center">{children}</div>
    </div>
  )
}

function SectionHeader({ title, description }) {
  return (
    <div className="mb-6">
      <h3 className="text-xl font-semibold mb-2 text-fg-80 border-b border-fg-08 pb-3">{title}</h3>
      {description && <p className="text-sm text-fg-64 mt-2">{description}</p>}
    </div>
  )
}

// ATOMS
function ButtonShowcase() {
  return (
    <ComponentShowcase name="Button" description="Unified button component with variants, sizes, and optional icons">
      <VariantGroup label="Primary">
        <Button variant="primary" size="sm">Small</Button>
        <Button variant="primary" size="md">Medium</Button>
        <Button variant="primary" size="lg">Large</Button>
        <Button variant="primary" iconLeft="arrow-up">Icon Left</Button>
        <Button variant="primary" iconRight="arrow-down">Icon Right</Button>
        <Button variant="primary" iconOnly="arrow-up" />
      </VariantGroup>
      <VariantGroup label="Secondary">
        <Button variant="secondary" size="sm">Small</Button>
        <Button variant="secondary" size="md">Medium</Button>
        <Button variant="secondary" size="lg">Large</Button>
        <Button variant="secondary" iconLeft="arrow-up">Icon Left</Button>
        <Button variant="secondary" iconRight="arrow-down">Icon Right</Button>
        <Button variant="secondary" iconOnly="arrow-up" />
      </VariantGroup>
      <VariantGroup label="Accent (Teal)">
        <Button variant="accent" size="sm">Small</Button>
        <Button variant="accent" size="md">Medium</Button>
        <Button variant="accent" size="lg">Large</Button>
        <Button variant="accent" iconLeft="arrow-up">Icon Left</Button>
        <Button variant="accent" iconRight="arrow-down">Icon Right</Button>
        <Button variant="accent" iconOnly="arrow-up" />
      </VariantGroup>
      <VariantGroup label="Outline">
        <Button variant="outline" size="sm">Small</Button>
        <Button variant="outline" size="md">Medium</Button>
        <Button variant="outline" size="lg">Large</Button>
        <Button variant="outline" iconLeft="arrow-up">Icon Left</Button>
        <Button variant="outline" iconRight="arrow-down">Icon Right</Button>
        <Button variant="outline" iconOnly="arrow-up" />
      </VariantGroup>
    </ComponentShowcase>
  )
}

function CheckboxShowcase() {
  return (
    <ComponentShowcase name="Checkbox" description="Checkbox input component">
      <VariantGroup label="States">
        <Checkbox label="Unchecked" />
        <Checkbox label="Checked" checked />
      </VariantGroup>
    </ComponentShowcase>
  )
}

function InputShowcase() {
  return (
    <ComponentShowcase name="Input" description="Text input component">
      <VariantGroup label="Sizes">
        <Input placeholder="Small input" size="sm" />
        <Input placeholder="Medium input" size="md" />
        <Input placeholder="Large input" size="lg" />
      </VariantGroup>
    </ComponentShowcase>
  )
}

function SliderShowcase() {
  return (
    <ComponentShowcase name="Slider" description="Range slider component">
      <VariantGroup label="Default">
        <Slider min={0} max={100} value={50} />
      </VariantGroup>
    </ComponentShowcase>
  )
}

function ToggleCheckboxShowcase() {
  return (
    <ComponentShowcase name="ToggleCheckbox" description="Toggle checkbox component">
      <VariantGroup label="States">
        <ToggleCheckbox label="Off" />
        <ToggleCheckbox label="On" checked />
      </VariantGroup>
    </ComponentShowcase>
  )
}

function ToggleSwitchShowcase() {
  return (
    <ComponentShowcase name="ToggleSwitch" description="Toggle switch component">
      <VariantGroup label="States">
        <ToggleSwitch label="Off" />
        <ToggleSwitch label="On" checked />
      </VariantGroup>
    </ComponentShowcase>
  )
}

// MOLECULES
function BadgeShowcase() {
  return (
    <ComponentShowcase name="Badge" description="Status and categorization indicator">
      <VariantGroup label="Default">
        <Badge variant="default" size="sm">Small</Badge>
        <Badge variant="default" size="md">Medium</Badge>
        <Badge variant="default" size="lg">Large</Badge>
      </VariantGroup>
      <VariantGroup label="Variants">
        <Badge variant="secondary">Secondary</Badge>
        <Badge variant="success">Success</Badge>
        <Badge variant="warning">Warning</Badge>
        <Badge variant="critical">Critical</Badge>
        <Badge variant="info">Info</Badge>
        <Badge variant="outline">Outline</Badge>
        <Badge variant="destructive">Destructive</Badge>
      </VariantGroup>
    </ComponentShowcase>
  )
}

function ButtonNavShowcase() {
  return (
    <ComponentShowcase name="ButtonNav" description="Navigation button component">
      <VariantGroup label="Default">
        <ButtonNav>Nav Button</ButtonNav>
      </VariantGroup>
    </ComponentShowcase>
  )
}

function DropdownShowcase() {
  return (
    <ComponentShowcase name="Dropdown" description="Dropdown selection component">
      <VariantGroup label="Sizes">
        <Dropdown size="sm" options={[{value: '1', label: 'Option 1'}]} />
        <Dropdown size="md" options={[{value: '1', label: 'Option 1'}]} />
        <Dropdown size="lg" options={[{value: '1', label: 'Option 1'}]} />
      </VariantGroup>
    </ComponentShowcase>
  )
}

function DropdownTagFilterShowcase() {
  return (
    <ComponentShowcase name="DropdownTagFilter" description="Dropdown with tag filtering">
      <VariantGroup label="Default">
        <DropdownTagFilter options={[{value: '1', label: 'Tag 1'}]} />
      </VariantGroup>
    </ComponentShowcase>
  )
}

function PillShowcase() {
  return (
    <ComponentShowcase name="Pill" description="Pill label component">
      <VariantGroup label="Variants">
        <Pill variant="inverse">Inverse</Pill>
        <Pill variant="subtle">Subtle</Pill>
        <Pill variant="outline">Outline</Pill>
      </VariantGroup>
      <VariantGroup label="Sizes">
        <Pill size="sm">Small</Pill>
        <Pill size="md">Medium</Pill>
        <Pill size="lg">Large</Pill>
      </VariantGroup>
    </ComponentShowcase>
  )
}

function QuantityInputShowcase() {
  return (
    <ComponentShowcase name="QuantityInput" description="Quantity input with +/- controls">
      <VariantGroup label="Default">
        <QuantityInput value={1} min={0} max={10} />
      </VariantGroup>
    </ComponentShowcase>
  )
}

function QuantityStepperShowcase() {
  return (
    <ComponentShowcase name="QuantityStepper" description="Quantity stepper component">
      <VariantGroup label="Default">
        <QuantityStepper value={1} min={0} max={10} />
      </VariantGroup>
    </ComponentShowcase>
  )
}

function SectionLabelShowcase() {
  return (
    <ComponentShowcase name="SectionLabel" description="Section label component">
      <VariantGroup label="Sizes">
        <SectionLabel size="sm">Small Label</SectionLabel>
        <SectionLabel size="md">Medium Label</SectionLabel>
        <SectionLabel size="lg">Large Label</SectionLabel>
      </VariantGroup>
    </ComponentShowcase>
  )
}

function TagShowcase() {
  return (
    <ComponentShowcase name="Tag" description="Tag component">
      <VariantGroup label="Default">
        <Tag>Tag 1</Tag>
        <Tag>Tag 2</Tag>
        <Tag>Tag 3</Tag>
      </VariantGroup>
    </ComponentShowcase>
  )
}

function ToggleBracketShowcase() {
  return (
    <ComponentShowcase name="ToggleBracket" description="Toggle bracket component">
      <VariantGroup label="States">
        <ToggleBracket>Off</ToggleBracket>
        <ToggleBracket active>On</ToggleBracket>
      </VariantGroup>
    </ComponentShowcase>
  )
}

function UnitSelectorShowcase() {
  return (
    <ComponentShowcase name="UnitSelector" description="Unit selector component">
      <VariantGroup label="Default">
        <UnitSelector options={[{value: 'px', label: 'px'}, {value: 'em', label: 'em'}]} />
      </VariantGroup>
    </ComponentShowcase>
  )
}

function ViewToggleShowcase() {
  return (
    <ComponentShowcase name="ViewToggle" description="View toggle component">
      <VariantGroup label="Default">
        <ViewToggle options={[{value: 'grid', label: 'Grid'}, {value: 'list', label: 'List'}]} />
      </VariantGroup>
    </ComponentShowcase>
  )
}

function ThemeToggleButtonShowcase() {
  return (
    <ComponentShowcase name="ThemeToggleButton" description="Icon button that toggles light/dark mode">
      <VariantGroup label="Default">
        <ThemeToggleButton />
      </VariantGroup>
    </ComponentShowcase>
  )
}

function IconShowcase() {
  return (
    <ComponentShowcase name="Icon" description="Icon component with SVG library">
      <VariantGroup label="Icons">
        <Icon name="arrow-up" size={24} />
        <Icon name="arrow-down" size={24} />
        <Icon name="arrow-left" size={24} />
        <Icon name="arrow-right" size={24} />
      </VariantGroup>
    </ComponentShowcase>
  )
}

export default function Components() {
  return (
    <div className="p-6">
      <header className="mb-8">
        <h2 className="text-2xl font-bold mb-2">Component Library</h2>
        <p className="text-fg-64">All 20 components from the design system</p>
      </header>

      {/* ATOMS */}
      <section className="mb-10">
        <SectionHeader title="Atoms (6)" description="Basic building blocks" />
        <ButtonShowcase />
        <CheckboxShowcase />
        <InputShowcase />
        <SliderShowcase />
        <ToggleCheckboxShowcase />
        <ToggleSwitchShowcase />
      </section>

      {/* MOLECULES */}
      <section className="mb-10">
        <SectionHeader title="Molecules (13)" description="Composite UI elements" />
        <BadgeShowcase />
        <ButtonNavShowcase />
        <DropdownShowcase />
        <DropdownTagFilterShowcase />
        <PillShowcase />
        <QuantityInputShowcase />
        <QuantityStepperShowcase />
        <SectionLabelShowcase />
        <TagShowcase />
        <ToggleBracketShowcase />
        <UnitSelectorShowcase />
        <ViewToggleShowcase />
        <ThemeToggleButtonShowcase />
      </section>

      {/* ICONS */}
      <section className="mb-10">
        <SectionHeader title="Icons (1)" description="Icon system with SVG library" />
        <IconShowcase />
      </section>
    </div>
  )
}
