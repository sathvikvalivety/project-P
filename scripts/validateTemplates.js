const { RECIPE_TEMPLATES } = require('../src/tools/recipeTemplates');
const { TOOL_REGISTRY } = require('../src/tools/registry');

console.log("Validating Recipe Templates...");

let errors = 0;

RECIPE_TEMPLATES.forEach(template => {
  console.log(`Checking template: ${template.name}...`);
  
  if (!template.steps || template.steps.length === 0) {
    console.error(`- Error: Template ${template.name} has no steps.`);
    errors++;
  }

  template.steps.forEach(step => {
    const tool = TOOL_REGISTRY.find(t => t.id === step.toolId);
    if (!tool) {
      console.error(`- Error: Step with toolId ${step.toolId} in template ${template.name} not found in registry.`);
      errors++;
    }
  });
});

if (errors > 0) {
  console.error(`\nValidation failed with ${errors} errors.`);
  process.exit(1);
} else {
  console.log("\nAll templates are valid.");
}
