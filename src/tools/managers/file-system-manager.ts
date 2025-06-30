// File system operations management

import * as fs from 'fs-extra';
import * as path from 'path';
import type { ProjectMetaTemplate } from '../../models';
import { stringifyYaml } from '../../utils/yaml-utils';

/**
 * Interface for file system operations
 */
export interface FileSystemManager {
  ensureDirectories(directories: string[]): Promise<string[]>;
  checkExistingFiles(files: string[], force: boolean): Promise<string | null>;
  writeProjectMeta(filePath: string, projectMeta: ProjectMetaTemplate): Promise<void>;
  writeTextFile(filePath: string, content: string): Promise<void>;
  writeJsonFile(filePath: string, data: object): Promise<void>;
}

/**
 * Default file system manager implementation
 */
export class DefaultFileSystemManager implements FileSystemManager {
  async ensureDirectories(directories: string[]): Promise<string[]> {
    const createdDirectories: string[] = [];

    for (const dir of directories) {
      await fs.ensureDir(dir);
      createdDirectories.push(dir);
    }

    return createdDirectories;
  }

  async checkExistingFiles(files: string[], force: boolean): Promise<string | null> {
    if (force) {
      return null; // Skip check if force is true
    }

    for (const file of files) {
      if (await fs.pathExists(file)) {
        return `File already exists: ${file}. Use force=true to overwrite.`;
      }
    }

    return null;
  }

  async writeProjectMeta(filePath: string, projectMeta: ProjectMetaTemplate): Promise<void> {
    const yamlResult = stringifyYaml(projectMeta, {
      indent: 2,
      noRefs: true,
      sortKeys: false
    });

    if (!yamlResult.success) {
      throw new Error(`Failed to serialize project meta: ${yamlResult.error}`);
    }

    await fs.writeFile(filePath, yamlResult.yaml);
  }

  async writeTextFile(filePath: string, content: string): Promise<void> {
    await fs.writeFile(filePath, content);
  }

  async writeJsonFile(filePath: string, data: object): Promise<void> {
    const jsonContent = JSON.stringify(data, null, 2);
    await fs.writeFile(filePath, jsonContent);
  }
}

/**
 * Directory structure definitions
 */
export class DirectoryStructure {
  static getStandardDirectories(): string[] {
    return [
      'tests/manual-tests',
      'tests/manual-tests/test-cases',
      'tests/manual-tests/test-results',
      'tests/manual-tests/templates'
    ];
  }

  static getFilesToCheck(): string[] {
    return [
      'tests/manual-tests/project-meta.yml',
      'tests/manual-tests/README.md'
    ];
  }

  static getFilePaths() {
    return {
      projectMeta: 'tests/manual-tests/project-meta.yml',
      readme: 'tests/manual-tests/README.md',
      template: 'tests/manual-tests/templates/test-case-template.yml',
      mcpConfig: '.mcp.json'
    };
  }
}

// Default manager instance
export const defaultFileSystemManager = new DefaultFileSystemManager();