// Project initialization result types

export interface InitProjectInput {
  projectName: string;
  baseUrl: string;
  environments?: {
    [key: string]: string;
  };
  features?: Array<{
    name: string;
    description: string;
  }>;
  testDataTemplate?: boolean;
  mcpConfig?: boolean;
  force?: boolean; // Overwrite existing files
}

export interface InitSuccessResult {
  success: true;
  createdFiles: string[];
  createdDirectories: string[];
  message: string;
}

export interface InitErrorResult {
  success: false;
  error: string;
}

export type InitResult = InitSuccessResult | InitErrorResult;

export interface ProjectMetaTemplate {
  project: {
    name: string;
    description: string;
    version: string;
  };
  environments: {
    [key: string]: string;
  };
  features: Array<{
    name: string;
    description: string;
    enabled: boolean;
  }>;
  test_data: {
    users: {
      [key: string]: {
        username: string;
        password: string;
        email?: string;
      };
    };
    products?: {
      [key: string]: {
        name: string;
        price: number;
        description?: string;
      };
    };
  };
  common_selectors: {
    [key: string]: {
      [key: string]: string;
    };
  };
}