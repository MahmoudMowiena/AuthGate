'use strict';

customElements.define('compodoc-menu', class extends HTMLElement {
    constructor() {
        super();
        this.isNormalMode = this.getAttribute('mode') === 'normal';
    }

    connectedCallback() {
        this.render(this.isNormalMode);
    }

    render(isNormalMode) {
        let tp = lithtml.html(`
        <nav>
            <ul class="list">
                <li class="title">
                    <a href="index.html" data-type="index-link">auth-gate documentation</a>
                </li>

                <li class="divider"></li>
                ${ isNormalMode ? `<div id="book-search-input" role="search"><input type="text" placeholder="Type to search"></div>` : '' }
                <li class="chapter">
                    <a data-type="chapter-link" href="index.html"><span class="icon ion-ios-home"></span>Getting started</a>
                    <ul class="links">
                        <li class="link">
                            <a href="overview.html" data-type="chapter-link">
                                <span class="icon ion-ios-keypad"></span>Overview
                            </a>
                        </li>
                        <li class="link">
                            <a href="index.html" data-type="chapter-link">
                                <span class="icon ion-ios-paper"></span>README
                            </a>
                        </li>
                                <li class="link">
                                    <a href="dependencies.html" data-type="chapter-link">
                                        <span class="icon ion-ios-list"></span>Dependencies
                                    </a>
                                </li>
                                <li class="link">
                                    <a href="properties.html" data-type="chapter-link">
                                        <span class="icon ion-ios-apps"></span>Properties
                                    </a>
                                </li>
                    </ul>
                </li>
                    <li class="chapter modules">
                        <a data-type="chapter-link" href="modules.html">
                            <div class="menu-toggler linked" data-bs-toggle="collapse" ${ isNormalMode ?
                                'data-bs-target="#modules-links"' : 'data-bs-target="#xs-modules-links"' }>
                                <span class="icon ion-ios-archive"></span>
                                <span class="link-name">Modules</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                        </a>
                        <ul class="links collapse " ${ isNormalMode ? 'id="modules-links"' : 'id="xs-modules-links"' }>
                            <li class="link">
                                <a href="modules/AppModule.html" data-type="entity-link" >AppModule</a>
                            </li>
                            <li class="link">
                                <a href="modules/AuthModule.html" data-type="entity-link" >AuthModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-AuthModule-a9c74b15aedc2bfccb5c478a1c01db05db898bced66247aa90acf0c3be7a5b4f5ed45bb7a27fdccd45129f355907bef3f22fdf9aab09e0e993e308fd44977f58"' : 'data-bs-target="#xs-controllers-links-module-AuthModule-a9c74b15aedc2bfccb5c478a1c01db05db898bced66247aa90acf0c3be7a5b4f5ed45bb7a27fdccd45129f355907bef3f22fdf9aab09e0e993e308fd44977f58"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-AuthModule-a9c74b15aedc2bfccb5c478a1c01db05db898bced66247aa90acf0c3be7a5b4f5ed45bb7a27fdccd45129f355907bef3f22fdf9aab09e0e993e308fd44977f58"' :
                                            'id="xs-controllers-links-module-AuthModule-a9c74b15aedc2bfccb5c478a1c01db05db898bced66247aa90acf0c3be7a5b4f5ed45bb7a27fdccd45129f355907bef3f22fdf9aab09e0e993e308fd44977f58"' }>
                                            <li class="link">
                                                <a href="controllers/AuthController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AuthController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-AuthModule-a9c74b15aedc2bfccb5c478a1c01db05db898bced66247aa90acf0c3be7a5b4f5ed45bb7a27fdccd45129f355907bef3f22fdf9aab09e0e993e308fd44977f58"' : 'data-bs-target="#xs-injectables-links-module-AuthModule-a9c74b15aedc2bfccb5c478a1c01db05db898bced66247aa90acf0c3be7a5b4f5ed45bb7a27fdccd45129f355907bef3f22fdf9aab09e0e993e308fd44977f58"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-AuthModule-a9c74b15aedc2bfccb5c478a1c01db05db898bced66247aa90acf0c3be7a5b4f5ed45bb7a27fdccd45129f355907bef3f22fdf9aab09e0e993e308fd44977f58"' :
                                        'id="xs-injectables-links-module-AuthModule-a9c74b15aedc2bfccb5c478a1c01db05db898bced66247aa90acf0c3be7a5b4f5ed45bb7a27fdccd45129f355907bef3f22fdf9aab09e0e993e308fd44977f58"' }>
                                        <li class="link">
                                            <a href="injectables/AuthService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AuthService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/EmailService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >EmailService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/FacebookAuthStrategy.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >FacebookAuthStrategy</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/GithubAuthStrategy.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >GithubAuthStrategy</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/GoogleAuthStrategy.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >GoogleAuthStrategy</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/PaypalModule.html" data-type="entity-link" >PaypalModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-PaypalModule-140d8c23be9fb4841700885427b500ff401ed0710c260d93882304bf5a2a8406acd1ca3cb3707e05a4401b8c29116e78960da42ae9e6d22572bf7baed5a87ac9"' : 'data-bs-target="#xs-controllers-links-module-PaypalModule-140d8c23be9fb4841700885427b500ff401ed0710c260d93882304bf5a2a8406acd1ca3cb3707e05a4401b8c29116e78960da42ae9e6d22572bf7baed5a87ac9"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-PaypalModule-140d8c23be9fb4841700885427b500ff401ed0710c260d93882304bf5a2a8406acd1ca3cb3707e05a4401b8c29116e78960da42ae9e6d22572bf7baed5a87ac9"' :
                                            'id="xs-controllers-links-module-PaypalModule-140d8c23be9fb4841700885427b500ff401ed0710c260d93882304bf5a2a8406acd1ca3cb3707e05a4401b8c29116e78960da42ae9e6d22572bf7baed5a87ac9"' }>
                                            <li class="link">
                                                <a href="controllers/PaypalController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PaypalController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-PaypalModule-140d8c23be9fb4841700885427b500ff401ed0710c260d93882304bf5a2a8406acd1ca3cb3707e05a4401b8c29116e78960da42ae9e6d22572bf7baed5a87ac9"' : 'data-bs-target="#xs-injectables-links-module-PaypalModule-140d8c23be9fb4841700885427b500ff401ed0710c260d93882304bf5a2a8406acd1ca3cb3707e05a4401b8c29116e78960da42ae9e6d22572bf7baed5a87ac9"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-PaypalModule-140d8c23be9fb4841700885427b500ff401ed0710c260d93882304bf5a2a8406acd1ca3cb3707e05a4401b8c29116e78960da42ae9e6d22572bf7baed5a87ac9"' :
                                        'id="xs-injectables-links-module-PaypalModule-140d8c23be9fb4841700885427b500ff401ed0710c260d93882304bf5a2a8406acd1ca3cb3707e05a4401b8c29116e78960da42ae9e6d22572bf7baed5a87ac9"' }>
                                        <li class="link">
                                            <a href="injectables/PaypalService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PaypalService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/PaypalTransactionService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PaypalTransactionService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/ProjectsModule.html" data-type="entity-link" >ProjectsModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-ProjectsModule-b87294bd5135b3abe74615d44c5ed880427cc926f954ea2e131f551e061df4a8a18ce3bbe8970c86bd5c9967340c934293dc25423c2986b574ec6095f6a2c50b"' : 'data-bs-target="#xs-controllers-links-module-ProjectsModule-b87294bd5135b3abe74615d44c5ed880427cc926f954ea2e131f551e061df4a8a18ce3bbe8970c86bd5c9967340c934293dc25423c2986b574ec6095f6a2c50b"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-ProjectsModule-b87294bd5135b3abe74615d44c5ed880427cc926f954ea2e131f551e061df4a8a18ce3bbe8970c86bd5c9967340c934293dc25423c2986b574ec6095f6a2c50b"' :
                                            'id="xs-controllers-links-module-ProjectsModule-b87294bd5135b3abe74615d44c5ed880427cc926f954ea2e131f551e061df4a8a18ce3bbe8970c86bd5c9967340c934293dc25423c2986b574ec6095f6a2c50b"' }>
                                            <li class="link">
                                                <a href="controllers/ProjectsController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ProjectsController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-ProjectsModule-b87294bd5135b3abe74615d44c5ed880427cc926f954ea2e131f551e061df4a8a18ce3bbe8970c86bd5c9967340c934293dc25423c2986b574ec6095f6a2c50b"' : 'data-bs-target="#xs-injectables-links-module-ProjectsModule-b87294bd5135b3abe74615d44c5ed880427cc926f954ea2e131f551e061df4a8a18ce3bbe8970c86bd5c9967340c934293dc25423c2986b574ec6095f6a2c50b"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-ProjectsModule-b87294bd5135b3abe74615d44c5ed880427cc926f954ea2e131f551e061df4a8a18ce3bbe8970c86bd5c9967340c934293dc25423c2986b574ec6095f6a2c50b"' :
                                        'id="xs-injectables-links-module-ProjectsModule-b87294bd5135b3abe74615d44c5ed880427cc926f954ea2e131f551e061df4a8a18ce3bbe8970c86bd5c9967340c934293dc25423c2986b574ec6095f6a2c50b"' }>
                                        <li class="link">
                                            <a href="injectables/ProjectService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ProjectService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/TenantModule.html" data-type="entity-link" >TenantModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-TenantModule-f1ca983f482c09b2824372fb6a9b5c8ef62f29c82d858bdf1e27f13b3c12372d842212f5f57b4381aaf821715eb33bae4d47027a2faaba7711758fd7be4429c3"' : 'data-bs-target="#xs-controllers-links-module-TenantModule-f1ca983f482c09b2824372fb6a9b5c8ef62f29c82d858bdf1e27f13b3c12372d842212f5f57b4381aaf821715eb33bae4d47027a2faaba7711758fd7be4429c3"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-TenantModule-f1ca983f482c09b2824372fb6a9b5c8ef62f29c82d858bdf1e27f13b3c12372d842212f5f57b4381aaf821715eb33bae4d47027a2faaba7711758fd7be4429c3"' :
                                            'id="xs-controllers-links-module-TenantModule-f1ca983f482c09b2824372fb6a9b5c8ef62f29c82d858bdf1e27f13b3c12372d842212f5f57b4381aaf821715eb33bae4d47027a2faaba7711758fd7be4429c3"' }>
                                            <li class="link">
                                                <a href="controllers/TenantController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >TenantController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-TenantModule-f1ca983f482c09b2824372fb6a9b5c8ef62f29c82d858bdf1e27f13b3c12372d842212f5f57b4381aaf821715eb33bae4d47027a2faaba7711758fd7be4429c3"' : 'data-bs-target="#xs-injectables-links-module-TenantModule-f1ca983f482c09b2824372fb6a9b5c8ef62f29c82d858bdf1e27f13b3c12372d842212f5f57b4381aaf821715eb33bae4d47027a2faaba7711758fd7be4429c3"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-TenantModule-f1ca983f482c09b2824372fb6a9b5c8ef62f29c82d858bdf1e27f13b3c12372d842212f5f57b4381aaf821715eb33bae4d47027a2faaba7711758fd7be4429c3"' :
                                        'id="xs-injectables-links-module-TenantModule-f1ca983f482c09b2824372fb6a9b5c8ef62f29c82d858bdf1e27f13b3c12372d842212f5f57b4381aaf821715eb33bae4d47027a2faaba7711758fd7be4429c3"' }>
                                        <li class="link">
                                            <a href="injectables/AuthService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AuthService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/EmailService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >EmailService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/ImageService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ImageService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/TenantsService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >TenantsService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/UserModule.html" data-type="entity-link" >UserModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-UserModule-eddbaad25661a676ec7eaffa81505b85db634246c63f618c2a94263f9bb19efa1d34f84af758495b66a1e417cb4eef9bccf9e07c29dcc6064be5128754c7d7ec"' : 'data-bs-target="#xs-controllers-links-module-UserModule-eddbaad25661a676ec7eaffa81505b85db634246c63f618c2a94263f9bb19efa1d34f84af758495b66a1e417cb4eef9bccf9e07c29dcc6064be5128754c7d7ec"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-UserModule-eddbaad25661a676ec7eaffa81505b85db634246c63f618c2a94263f9bb19efa1d34f84af758495b66a1e417cb4eef9bccf9e07c29dcc6064be5128754c7d7ec"' :
                                            'id="xs-controllers-links-module-UserModule-eddbaad25661a676ec7eaffa81505b85db634246c63f618c2a94263f9bb19efa1d34f84af758495b66a1e417cb4eef9bccf9e07c29dcc6064be5128754c7d7ec"' }>
                                            <li class="link">
                                                <a href="controllers/UserController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >UserController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-UserModule-eddbaad25661a676ec7eaffa81505b85db634246c63f618c2a94263f9bb19efa1d34f84af758495b66a1e417cb4eef9bccf9e07c29dcc6064be5128754c7d7ec"' : 'data-bs-target="#xs-injectables-links-module-UserModule-eddbaad25661a676ec7eaffa81505b85db634246c63f618c2a94263f9bb19efa1d34f84af758495b66a1e417cb4eef9bccf9e07c29dcc6064be5128754c7d7ec"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-UserModule-eddbaad25661a676ec7eaffa81505b85db634246c63f618c2a94263f9bb19efa1d34f84af758495b66a1e417cb4eef9bccf9e07c29dcc6064be5128754c7d7ec"' :
                                        'id="xs-injectables-links-module-UserModule-eddbaad25661a676ec7eaffa81505b85db634246c63f618c2a94263f9bb19efa1d34f84af758495b66a1e417cb4eef9bccf9e07c29dcc6064be5128754c7d7ec"' }>
                                        <li class="link">
                                            <a href="injectables/AuthService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AuthService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/EmailService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >EmailService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/ImageService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ImageService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/IndexManagementService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >IndexManagementService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/UsersService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >UsersService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                </ul>
                </li>
                        <li class="chapter">
                            <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#controllers-links"' :
                                'data-bs-target="#xs-controllers-links"' }>
                                <span class="icon ion-md-swap"></span>
                                <span>Controllers</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                            <ul class="links collapse " ${ isNormalMode ? 'id="controllers-links"' : 'id="xs-controllers-links"' }>
                                <li class="link">
                                    <a href="controllers/AuthController.html" data-type="entity-link" >AuthController</a>
                                </li>
                                <li class="link">
                                    <a href="controllers/PaypalController.html" data-type="entity-link" >PaypalController</a>
                                </li>
                                <li class="link">
                                    <a href="controllers/ProjectsController.html" data-type="entity-link" >ProjectsController</a>
                                </li>
                                <li class="link">
                                    <a href="controllers/TenantController.html" data-type="entity-link" >TenantController</a>
                                </li>
                                <li class="link">
                                    <a href="controllers/UserController.html" data-type="entity-link" >UserController</a>
                                </li>
                            </ul>
                        </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#classes-links"' :
                            'data-bs-target="#xs-classes-links"' }>
                            <span class="icon ion-ios-paper"></span>
                            <span>Classes</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="classes-links"' : 'id="xs-classes-links"' }>
                            <li class="link">
                                <a href="classes/HttpExceptionFilter.html" data-type="entity-link" >HttpExceptionFilter</a>
                            </li>
                            <li class="link">
                                <a href="classes/PaypalTransaction.html" data-type="entity-link" >PaypalTransaction</a>
                            </li>
                            <li class="link">
                                <a href="classes/Project.html" data-type="entity-link" >Project</a>
                            </li>
                            <li class="link">
                                <a href="classes/projectModel.html" data-type="entity-link" >projectModel</a>
                            </li>
                            <li class="link">
                                <a href="classes/SignInRequest.html" data-type="entity-link" >SignInRequest</a>
                            </li>
                            <li class="link">
                                <a href="classes/SignInTenantResponse.html" data-type="entity-link" >SignInTenantResponse</a>
                            </li>
                            <li class="link">
                                <a href="classes/SignInUserResponse.html" data-type="entity-link" >SignInUserResponse</a>
                            </li>
                            <li class="link">
                                <a href="classes/Tenant.html" data-type="entity-link" >Tenant</a>
                            </li>
                            <li class="link">
                                <a href="classes/tenantModel.html" data-type="entity-link" >tenantModel</a>
                            </li>
                            <li class="link">
                                <a href="classes/updateTenantModel.html" data-type="entity-link" >updateTenantModel</a>
                            </li>
                            <li class="link">
                                <a href="classes/updateUserModel.html" data-type="entity-link" >updateUserModel</a>
                            </li>
                            <li class="link">
                                <a href="classes/User.html" data-type="entity-link" >User</a>
                            </li>
                            <li class="link">
                                <a href="classes/userModel.html" data-type="entity-link" >userModel</a>
                            </li>
                            <li class="link">
                                <a href="classes/UserProject.html" data-type="entity-link" >UserProject</a>
                            </li>
                            <li class="link">
                                <a href="classes/userProjectModel.html" data-type="entity-link" >userProjectModel</a>
                            </li>
                        </ul>
                    </li>
                        <li class="chapter">
                            <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#injectables-links"' :
                                'data-bs-target="#xs-injectables-links"' }>
                                <span class="icon ion-md-arrow-round-down"></span>
                                <span>Injectables</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                            <ul class="links collapse " ${ isNormalMode ? 'id="injectables-links"' : 'id="xs-injectables-links"' }>
                                <li class="link">
                                    <a href="injectables/AuthService.html" data-type="entity-link" >AuthService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/EmailService.html" data-type="entity-link" >EmailService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/FacebookAuthStrategy.html" data-type="entity-link" >FacebookAuthStrategy</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/GithubAuthStrategy.html" data-type="entity-link" >GithubAuthStrategy</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/GoogleAuthStrategy.html" data-type="entity-link" >GoogleAuthStrategy</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ImageService.html" data-type="entity-link" >ImageService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/IndexManagementService.html" data-type="entity-link" >IndexManagementService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/PaypalService.html" data-type="entity-link" >PaypalService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/PaypalTransactionService.html" data-type="entity-link" >PaypalTransactionService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ProjectService.html" data-type="entity-link" >ProjectService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ResponseInterceptor.html" data-type="entity-link" >ResponseInterceptor</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/TenantsService.html" data-type="entity-link" >TenantsService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/UsersService.html" data-type="entity-link" >UsersService</a>
                                </li>
                            </ul>
                        </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#guards-links"' :
                            'data-bs-target="#xs-guards-links"' }>
                            <span class="icon ion-ios-lock"></span>
                            <span>Guards</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="guards-links"' : 'id="xs-guards-links"' }>
                            <li class="link">
                                <a href="guards/AuthenticationGuard.html" data-type="entity-link" >AuthenticationGuard</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#miscellaneous-links"'
                            : 'data-bs-target="#xs-miscellaneous-links"' }>
                            <span class="icon ion-ios-cube"></span>
                            <span>Miscellaneous</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="miscellaneous-links"' : 'id="xs-miscellaneous-links"' }>
                            <li class="link">
                                <a href="miscellaneous/functions.html" data-type="entity-link">Functions</a>
                            </li>
                            <li class="link">
                                <a href="miscellaneous/typealiases.html" data-type="entity-link">Type aliases</a>
                            </li>
                            <li class="link">
                                <a href="miscellaneous/variables.html" data-type="entity-link">Variables</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <a data-type="chapter-link" href="coverage.html"><span class="icon ion-ios-stats"></span>Documentation coverage</a>
                    </li>
                    <li class="divider"></li>
                    <li class="copyright">
                        Documentation generated using <a href="https://compodoc.app/" target="_blank" rel="noopener noreferrer">
                            <img data-src="images/compodoc-vectorise.png" class="img-responsive" data-type="compodoc-logo">
                        </a>
                    </li>
            </ul>
        </nav>
        `);
        this.innerHTML = tp.strings;
    }
});