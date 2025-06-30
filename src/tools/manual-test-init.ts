import type { InitProjectInput, InitResult } from '../models';
import { defaultInitInputValidator } from './validators/init-input-validator';
import { defaultProjectMetaGenerator } from './generators/project-meta-generator';
import { defaultFileContentGenerator } from './generators/file-content-generator';
import { defaultFileSystemManager, DirectoryStructure } from './managers/file-system-manager';

/**
 * Initialize manual test project structure
 */
export async function initProject(input: InitProjectInput): Promise<InitResult> {
  try {
    // Validate input
    const validationError = defaultInitInputValidator.validate(input);
    if (validationError) {
      return {
        success: false,
        error: validationError
      };
    }

    // Check existing files
    const filesToCheck = DirectoryStructure.getFilesToCheck();
    const existingError = await defaultFileSystemManager.checkExistingFiles(filesToCheck, input.force || false);
    if (existingError) {
      return {
        success: false,
        error: existingError
      };
    }

    // Create directory structure
    const directories = DirectoryStructure.getStandardDirectories();
    const createdDirectories = await defaultFileSystemManager.ensureDirectories(directories);

    const createdFiles: string[] = [];
    const filePaths = DirectoryStructure.getFilePaths();

    // Generate and write project metadata
    const projectMeta = defaultProjectMetaGenerator.generateProjectMeta(input);
    await defaultFileSystemManager.writeProjectMeta(filePaths.projectMeta, projectMeta);
    createdFiles.push(filePaths.projectMeta);

    // Generate and write README
    const readmeContent = defaultFileContentGenerator.generateReadme(input);
    await defaultFileSystemManager.writeTextFile(filePaths.readme, readmeContent);
    createdFiles.push(filePaths.readme);

    // Generate and write test case template
    const templateContent = defaultFileContentGenerator.generateTestCaseTemplate();
    await defaultFileSystemManager.writeTextFile(filePaths.template, templateContent);
    createdFiles.push(filePaths.template);

    // Create MCP config if requested
    if (input.mcpConfig) {
      const mcpConfig = defaultFileContentGenerator.generateMcpConfig();
      await defaultFileSystemManager.writeJsonFile(filePaths.mcpConfig, mcpConfig);
      createdFiles.push(filePaths.mcpConfig);
    }

    return {
      success: true,
      createdFiles,
      createdDirectories,
      message: `Project '${input.projectName}' initialized successfully!`
    };

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error during project initialization';
    return {
      success: false,
      error: `Initialization error: ${message}`
    };
  }
}

// Re-export types and utilities for convenience
export type { InitProjectInput, InitResult } from '../models';
export { 
  defaultInitInputValidator, 
  defaultProjectMetaGenerator, 
  defaultFileContentGenerator, 
  defaultFileSystemManager 
};