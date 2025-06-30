// Project metadata generation strategies

import type { InitProjectInput, ProjectMetaTemplate } from '../../models';

/**
 * Interface for project metadata generation strategies
 */
export interface ProjectMetaGenerator {
  generateProjectMeta(input: InitProjectInput): ProjectMetaTemplate;
}

/**
 * Default project metadata generator implementation
 */
export class DefaultProjectMetaGenerator implements ProjectMetaGenerator {
  generateProjectMeta(input: InitProjectInput): ProjectMetaTemplate {
    const environments = this.generateEnvironments(input);
    const features = this.generateFeatures(input);
    const testData = this.generateTestData(input);
    const commonSelectors = this.generateCommonSelectors();

    return {
      project: {
        name: input.projectName,
        description: `${input.projectName}のマニュアルテスト`,
        version: '1.0.0'
      },
      environments,
      features: features.map(f => ({
        ...f,
        enabled: true
      })),
      test_data: testData,
      common_selectors: commonSelectors
    };
  }

  private generateEnvironments(input: InitProjectInput) {
    return input.environments || {
      production: input.baseUrl
    };
  }

  private generateFeatures(input: InitProjectInput) {
    return input.features || [
      { name: 'top-page', description: 'トップページ機能' },
      { name: 'login', description: 'ログイン機能' }
    ];
  }

  private generateTestData(input: InitProjectInput) {
    const baseTestData = {
      users: {
        valid_user: {
          username: 'testuser',
          password: 'testpass123'
        }
      }
    };

    if (input.testDataTemplate) {
      return {
        ...baseTestData,
        users: {
          ...baseTestData.users,
          valid_user: {
            ...baseTestData.users.valid_user,
            email: 'test@example.com'
          },
          invalid_user: {
            username: 'invalid',
            password: 'wrong'
          }
        },
        products: {
          sample_product: {
            name: 'サンプル商品',
            price: 1000,
            description: 'テスト用の商品'
          }
        }
      };
    }

    return baseTestData;
  }

  private generateCommonSelectors() {
    return {
      login_form: {
        username_field: '#username',
        password_field: '#password',
        login_button: '#login-button'
      },
      navigation: {
        home_link: 'a[href="/"]',
        logout_button: '#logout'
      }
    };
  }
}

// Default generator instance
export const defaultProjectMetaGenerator = new DefaultProjectMetaGenerator();