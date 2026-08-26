import type { AnatomyPart } from "./types";

export const magneticDipoleAnatomy: Record<number, AnatomyPart[]> = {
  58: [
    {
      tex: String.raw`\vec{B}`,
      label: "Dipole field",
      meaning: "The fuchsia loops the compass grid traces, worth about a tenth of a millitesla ten centimetres from a fridge magnet.",
      value: "1.0×10⁻⁴",
      unit: "T",
    },
    { tex: " = ", glue: true },
    {
      tex: String.raw`\frac{\mu_0}{4\pi}`,
      label: "Vacuum constant",
      meaning: "The conversion that turns ampere-metre moments into tesla at metre scales.",
      value: "1.0×10⁻⁷",
      unit: "T·m/A",
    },
    {
      tex: String.raw`\frac{3(\vec{m}\cdot\hat{r})\hat{r} - \vec{m}}{r^3}`,
      label: "Angle-and-distance pattern",
      meaning: "Needles swing hardest on the magnet’s axis and weakest broadside, all fading with distance cubed.",
      value: "1000",
      unit: "A/m",
    },
  ],
  59: [
    {
      tex: String.raw`\vec{\tau}`,
      label: "Aligning torque",
      meaning: "The twist that swings every red north tip into step with the local loop direction.",
      value: "1.0×10⁻⁴",
      unit: "N·m",
    },
    { tex: " = ", glue: true },
    {
      tex: String.raw`\vec{m}`,
      label: "Magnetic moment",
      meaning: "The bar magnet’s intrinsic strength, sketched inside it as an arrow from south to north.",
      value: "1",
      unit: "A·m²",
    },
    { tex: String.raw` \times `, glue: true },
    {
      tex: String.raw`\vec{B}`,
      label: "Ambient field",
      meaning: "Whatever dipole field the needle happens to occupy at that instant.",
      value: "1.0×10⁻⁴",
      unit: "T",
    },
  ],
  60: [
    {
      tex: String.raw`\nabla \cdot \vec{B}`,
      label: "Field divergence",
      meaning: "Counting field-line starts minus stops in any box of the compass lattice always nets nothing.",
      value: "0",
      unit: "T/m",
    },
    { tex: " = ", glue: true },
    {
      tex: "0",
      label: "Exactly zero",
      meaning: "Every fuchsia loop dives back through the magnet body, so no region ever leaks net flux.",
      value: "0",
      unit: "T/m",
    },
  ],
};
