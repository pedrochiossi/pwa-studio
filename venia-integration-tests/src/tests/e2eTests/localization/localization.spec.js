import {
    graphqlMockedCalls as graphqlMockedCallsFixtures,
    productPage as productPageFixtures,
    checkoutPage as checkoutPageFixtures,
    accountAccess as accountAccessFixtures,
    categoryPage as categoryPageFixtures
} from '../../../fixtures';
import {
    header as headerAssertions,
    checkoutPage as checkoutPageAssertions,
    accountAccess as accountAccessAssertions,
    myAccountMenu as myAccountMenuAssertions,
    footer as footerAssertions,
    productPage as productPageAssertions,
    miniCart as miniCartAssertions,
    cartPage as cartPageAssertions,
    categoryPage as categoryPageAssertions
} from '../../../assertions';
import {
    header as headerActions,
    categoryPage as categoryPageActions,
    productPage as productPageActions,
    checkoutPage as checkoutPageActions,
    cartPage as cartPageActions,
    miniCart as miniCartActions,
    myAccountMenu as myAccountMenuActions
} from '../../../actions';
import { cmsPage as cmsPageFields } from '../../../fields';
import { aliasMutation } from '../../../utils/graphql-test-utils';

const {
    assertCurrencyIsDisplayed,
    assertCurrencyIsNotDisplayed,
    assertCurrencyIsSelected,
    assertStoreIsDisplayed,
    assertStoreIsSelected,
    assertHeaderTextLanguage,
    assertProductSuggestionsHasCurrency
} = headerAssertions;

const { assertAccountMenuTextLanguage } = myAccountMenuAssertions;

const {
    assertSignInTextLanguage,
    assertCreateAccountTextLanguage,
    assertForgotPasswordTextLanguage
} = accountAccessAssertions;

const { assertFooterTextLanguage } = footerAssertions;

const {
    assertProductPageTextLanguage,
    assertProductPriceHasCurrency
} = productPageAssertions;

const {
    assertMiniCartProductHasCurrency,
    assertMiniCartTextLanguage
} = miniCartAssertions;

const {
    assertCartPageTextLanguage,
    assertCartPageHasCurrency
} = cartPageAssertions;

const {
    assertShippingInformationTextLanguage,
    assertPaymentInformationTextLanguage,
    assertPriceAdjustmentsTextLanguage,
    assertCheckoutPageHasCurrency,
    assertAddressInShippingInformationInCheckoutPage,
    assertProductInCheckoutPage,
    assertSelectedShippingMethodInCheckoutPage,
    assertOrderConfirmationPageTextLanguage
} = checkoutPageAssertions;

const {
    assertCategoryPageTextLanguage,
    assertCategoryPageProductsHaveCurrency
} = categoryPageAssertions;
const {
    changeStoreView,
    triggerCurrencySwitcherMenu,
    triggerStoreSwitcherMenu,
    triggerSearch,
    searchFromSearchBar,
    triggerAccountMenu,
    changeCurrency
} = headerActions;

const {
    setGuestShippingAddress,
    submitShippingMethod,
    reviewOrder,
    editCreditCardInformation,
    placeOrder,
    selectCreditCardPaymentMethod,
    setCustomerShippingAddress,
    toggleBillingAddressForm
} = checkoutPageActions;

const {
    selectCategoryFromMegaMenu,
    selectProductFromCategoryPage
} = categoryPageActions;

const {
    addToCartFromProductPage,
    selectOptionsFromProductPage
} = productPageActions;

const { triggerMiniCart, goToCartPageFromEditCartButton } = miniCartActions;

const { goToCheckout } = cartPageActions;

const { goToMyAccount } = myAccountMenuActions;

const { cmsPageContentHeading } = cmsPageFields;

const {
    getCMSPage,
    hitGraphqlPath,
    getSelectedAndAvailableShippingMethodsCall,
    getPaymentInformationCall,
    getProductDetailForProductPageCall,
    getCheckoutDetailsCall,
    getItemsInCartCall,
    getAutocompleteResultsCall
} = graphqlMockedCallsFixtures;

const {
    productIsadoraSkirt,
    productAugustaEarrings,
    productValeriaTwoLayeredTank
} = productPageFixtures;

const { categoryTops } = categoryPageFixtures;

const {
    checkoutCustomer1,
    checkoutBillingData,
    defaultShippingMethods
} = checkoutPageFixtures;

const {
    firstName,
    lastName,
    accountEmail,
    accountPassword
} = accountAccessFixtures;

describe('PWA-1415: Verify Venia Localization', () => {
    it('should display French store and Euro currency by default', () => {
        cy.visitHomePage();

        assertStoreIsDisplayed('French Store View');
        assertCurrencyIsDisplayed('EUR');

        triggerCurrencySwitcherMenu();
        assertCurrencyIsSelected('EUR');

        triggerStoreSwitcherMenu();
        assertStoreIsSelected('French Store View');
    });

    it('should not display currency switcher when Default Store View is selected (only USD)', () => {
        cy.visitHomePage();

        triggerStoreSwitcherMenu();
        changeStoreView('Default Store View');

        assertStoreIsDisplayed('Default Store View');
        assertCurrencyIsNotDisplayed();
    });

    it('should load custom CMS page content according to the selected store', () => {
        cy.intercept('GET', getCMSPage).as('gqlGetCMSPageQuery');

        cy.visitHomePage();
        cy.visit('/custom-page');
        cy.wait(['@gqlGetCMSPageQuery'], {
            timeout: 60000
        });

        cy.get(cmsPageContentHeading).then($heading => {
            expect($heading.text()).to.equal('Custom page for French Store');
        });

        triggerStoreSwitcherMenu();
        changeStoreView('Default Store View');

        cy.wait(['@gqlGetCMSPageQuery'], {
            timeout: 60000
        });

        cy.get(cmsPageContentHeading).then($heading => {
            expect($heading.text()).to.equal('Custom page for Default Store');
        });
    });

    it('should update store accordingly if changed from url', () => {
        cy.visitHomePage();
        selectCategoryFromMegaMenu('Bottoms');

        cy.url().then(url => cy.visit(url.replace('fr', 'default')));
        assertStoreIsDisplayed('Default Store View');
        assertStoreIsSelected('Default Store View');
    });

    it('should be able to place an order in French store', () => {
        cy.intercept('GET', getSelectedAndAvailableShippingMethodsCall).as(
            'gqlGetSelectedAndAvailableShippingMethodsQuery'
        );
        cy.intercept('GET', getPaymentInformationCall).as(
            'gqlGetPaymentInformationQuery'
        );
        cy.intercept('GET', getProductDetailForProductPageCall).as(
            'gqlGetProductDetailForProductPageQuery'
        );
        cy.intercept('GET', getItemsInCartCall).as('gqlGetItemsInCartQuery');
        cy.intercept('GET', getCheckoutDetailsCall).as(
            'gqlGetCheckoutDetailsQuery'
        );

        cy.intercept('POST', hitGraphqlPath, req => {
            aliasMutation(req, 'AddProductToCart');
            aliasMutation(req, 'placeOrder');
            aliasMutation(req, 'setSelectedPaymentMethod');
            aliasMutation(req, 'SetShippingMethod');
            aliasMutation(req, 'setBillingAddress');
        });

        cy.visitHomePage();
        assertStoreIsDisplayed('French Store View');

        cy.visit(productIsadoraSkirt.url);
        cy.wait(['@gqlGetProductDetailForProductPageQuery'], {
            timeout: 60000
        });

        selectOptionsFromProductPage();
        addToCartFromProductPage();

        cy.wait(['@gqlAddProductToCartMutation'], {
            timeout: 60000
        });

        cy.visitCheckoutPage();
        setGuestShippingAddress(checkoutCustomer1);

        cy.wait(['@gqlGetSelectedAndAvailableShippingMethodsQuery'], {
            timeout: 60000
        });

        submitShippingMethod();

        cy.wait(
            ['@gqlSetShippingMethodMutation', '@gqlGetPaymentInformationQuery'],
            { timeout: 60000 }
        );
        selectCreditCardPaymentMethod();

        editCreditCardInformation({ ...checkoutBillingData[0] });

        reviewOrder();

        cy.wait(
            [
                '@gqlsetBillingAddressMutation',
                '@gqlGetItemsInCartQuery',
                '@gqlsetSelectedPaymentMethodMutation'
            ],
            {
                timeout: 60000
            }
        );

        placeOrder();

        cy.wait(['@gqlplaceOrderMutation', '@gqlGetCheckoutDetailsQuery'], {
            timeout: 60000
        });

        assertAddressInShippingInformationInCheckoutPage(
            checkoutCustomer1,
            true
        );
        assertSelectedShippingMethodInCheckoutPage(
            defaultShippingMethods.free.label,
            true
        );
        assertProductInCheckoutPage(
            {
                name: productIsadoraSkirt.name,
                color: 'Lilac',
                quantity: 1,
                size: 2
            },
            true
        );
    });

    it('should display English text and USD currency accross app if Default Store View is selected', () => {
        cy.intercept('GET', getAutocompleteResultsCall).as(
            'gqlGetAutocompleteResultsQuery'
        );
        cy.intercept('GET', getProductDetailForProductPageCall).as(
            'gqlGetProductDetailForProductPageQuery'
        );
        cy.intercept('GET', getSelectedAndAvailableShippingMethodsCall).as(
            'gqlGetSelectedAndAvailableShippingMethodsQuery'
        );
        cy.intercept('GET', getPaymentInformationCall).as(
            'gqlGetPaymentInformationQuery'
        );
        cy.intercept('GET', getItemsInCartCall).as('gqlGetItemsInCartQuery');
        cy.intercept('GET', getCheckoutDetailsCall).as(
            'gqlGetCheckoutDetailsQuery'
        );

        cy.intercept('POST', hitGraphqlPath, req => {
            aliasMutation(req, 'CreateAccount');
            aliasMutation(req, 'SignInAfterCreate');
            aliasMutation(req, 'AddProductToCart');
            aliasMutation(req, 'SetShippingMethod');
            aliasMutation(req, 'setBillingAddress');
            aliasMutation(req, 'setSelectedPaymentMethod');
            aliasMutation(req, 'placeOrder');
        });

        cy.visitHomePage();
        triggerStoreSwitcherMenu();
        changeStoreView('Default Store View');
        // wait page reload
        cy.wait(5000);

        // check footer language
        assertFooterTextLanguage('eng');

        triggerSearch();
        searchFromSearchBar('Dress', false);
        cy.wait(['@gqlGetAutocompleteResultsQuery'], {
            timeout: 60000
        });

        // check header language
        assertHeaderTextLanguage('eng');
        assertProductSuggestionsHasCurrency('USD');
        cy.toggleLoginDialog();
        assertForgotPasswordTextLanguage('eng');

        // reset account menu
        cy.toggleLoginDialog();
        cy.toggleLoginDialog();

        assertSignInTextLanguage('eng');
        assertCreateAccountTextLanguage('eng');

        // reset account menu
        cy.toggleLoginDialog();
        cy.toggleLoginDialog();

        //create account and sign in
        cy.createAccount(firstName, lastName, accountEmail, accountPassword);

        cy.wait(
            ['@gqlCreateAccountMutation', '@gqlSignInAfterCreateMutation'],
            {
                timeout: 60000
            }
        );

        cy.toggleLoginDialog();
        assertAccountMenuTextLanguage('eng');

        //check Category page language/currency
        cy.visit(categoryTops.url);
        assertCategoryPageTextLanguage('eng');
        assertCategoryPageProductsHaveCurrency('USD');

        // Add configurable product to cart
        cy.visit(productIsadoraSkirt.url);
        cy.wait(['@gqlGetProductDetailForProductPageQuery'], {
            timeout: 60000
        });

        // check product page language/currency
        assertProductPageTextLanguage('eng');
        assertProductPriceHasCurrency('USD');

        selectOptionsFromProductPage();
        addToCartFromProductPage();

        cy.wait(['@gqlAddProductToCartMutation'], {
            timeout: 60000
        });

        // Add simple product to cart
        cy.visit(productAugustaEarrings.url);
        cy.wait(['@gqlGetProductDetailForProductPageQuery'], {
            timeout: 60000
        });
        addToCartFromProductPage();
        cy.wait(['@gqlAddProductToCartMutation'], {
            timeout: 60000
        });

        // check miniCart language/currency
        triggerMiniCart();
        assertMiniCartProductHasCurrency('USD');

        // check cartPage language/currency
        goToCartPageFromEditCartButton();
        assertCartPageTextLanguage('eng');
        assertCartPageHasCurrency('USD');

        // check checkoutPage language/currency
        goToCheckout();
        assertShippingInformationTextLanguage('eng');
        assertCheckoutPageHasCurrency('USD');

        setCustomerShippingAddress(checkoutCustomer1);
        cy.wait(
            [
                '@gqlGetSelectedAndAvailableShippingMethodsQuery',
                '@gqlSetShippingMethodMutation'
            ],
            {
                timeout: 60000
            }
        );

        selectCreditCardPaymentMethod();
        cy.wait(['@gqlGetPaymentInformationQuery'], {
            timeout: 60000
        });

        toggleBillingAddressForm();
        assertPaymentInformationTextLanguage('eng');
        toggleBillingAddressForm();

        editCreditCardInformation({ ...checkoutBillingData[0] });
        assertPriceAdjustmentsTextLanguage('eng');

        reviewOrder();
        cy.wait(
            [
                '@gqlsetBillingAddressMutation',
                '@gqlGetItemsInCartQuery',
                '@gqlsetSelectedPaymentMethodMutation'
            ],
            {
                timeout: 60000
            }
        );

        placeOrder();

        cy.wait(['@gqlplaceOrderMutation', '@gqlGetCheckoutDetailsQuery'], {
            timeout: 60000
        });

        assertOrderConfirmationPageTextLanguage('eng');
    });

    it('should display French text and EUR currency accross app if French Store View is selected', () => {
        cy.intercept('GET', getAutocompleteResultsCall).as(
            'gqlGetAutocompleteResultsQuery'
        );
        cy.intercept('GET', getProductDetailForProductPageCall).as(
            'gqlGetProductDetailForProductPageQuery'
        );
        cy.intercept('GET', getSelectedAndAvailableShippingMethodsCall).as(
            'gqlGetSelectedAndAvailableShippingMethodsQuery'
        );
        cy.intercept('GET', getPaymentInformationCall).as(
            'gqlGetPaymentInformationQuery'
        );
        cy.intercept('GET', getItemsInCartCall).as('gqlGetItemsInCartQuery');
        cy.intercept('GET', getCheckoutDetailsCall).as(
            'gqlGetCheckoutDetailsQuery'
        );

        cy.intercept('POST', hitGraphqlPath, req => {
            aliasMutation(req, 'SignInAfterCreate');
            aliasMutation(req, 'CreateAccount');
            aliasMutation(req, 'AddProductToCart');
            aliasMutation(req, 'SetShippingMethod');
            aliasMutation(req, 'setBillingAddress');
            aliasMutation(req, 'setSelectedPaymentMethod');
            aliasMutation(req, 'placeOrder');
        });

        cy.visitHomePage();

        // check footer language
        assertFooterTextLanguage('fra');

        triggerSearch();
        searchFromSearchBar('Dress', false);
        cy.wait(['@gqlGetAutocompleteResultsQuery'], {
            timeout: 60000
        });

        // check header language
        assertHeaderTextLanguage('fra');
        assertProductSuggestionsHasCurrency('EUR');
        cy.toggleLoginDialog();
        assertForgotPasswordTextLanguage('fra');

        // reset account menu
        cy.toggleLoginDialog();
        cy.toggleLoginDialog();

        assertSignInTextLanguage('fra');
        assertCreateAccountTextLanguage('fra');

        // reset account menu
        cy.toggleLoginDialog();
        cy.toggleLoginDialog();

        //create account and sign in
        cy.createAccount(
            firstName,
            lastName,
            `${Cypress._.random(0, 1e6)}test@example.com`,
            accountPassword
        );

        cy.wait(
            ['@gqlCreateAccountMutation', '@gqlSignInAfterCreateMutation'],
            {
                timeout: 60000
            }
        );

        cy.toggleLoginDialog();
        assertAccountMenuTextLanguage('fra');

        //check Category page language/currency
        cy.visit(categoryTops.url);
        assertCategoryPageTextLanguage('fra');
        assertCategoryPageProductsHaveCurrency('EUR');

        // Add configurable product to cart
        cy.visit(productIsadoraSkirt.url);
        cy.wait(['@gqlGetProductDetailForProductPageQuery'], {
            timeout: 60000
        });

        // check product page language/currency
        assertProductPageTextLanguage('fra');
        assertProductPriceHasCurrency('EUR');

        selectOptionsFromProductPage();
        addToCartFromProductPage();

        cy.wait(['@gqlAddProductToCartMutation'], {
            timeout: 60000
        });

        // Add simple product to cart
        cy.visit(productAugustaEarrings.url);
        cy.wait(['@gqlGetProductDetailForProductPageQuery'], {
            timeout: 60000
        });
        addToCartFromProductPage();
        cy.wait(['@gqlAddProductToCartMutation'], {
            timeout: 60000
        });

        // check miniCart language/currency
        triggerMiniCart();
        assertMiniCartTextLanguage('fra');
        assertMiniCartProductHasCurrency('EUR');

        // check cartPage language/currency
        goToCartPageFromEditCartButton();
        assertCartPageTextLanguage('fra');
        assertCartPageHasCurrency('EUR');

        // check checkoutPage language/currency
        goToCheckout();
        assertShippingInformationTextLanguage('fra');
        assertCheckoutPageHasCurrency('EUR');

        setCustomerShippingAddress(checkoutCustomer1);
        cy.wait(
            [
                '@gqlGetSelectedAndAvailableShippingMethodsQuery',
                '@gqlSetShippingMethodMutation'
            ],
            {
                timeout: 60000
            }
        );

        selectCreditCardPaymentMethod();
        cy.wait(['@gqlGetPaymentInformationQuery'], {
            timeout: 60000
        });

        toggleBillingAddressForm();
        assertPaymentInformationTextLanguage('fra');
        toggleBillingAddressForm();

        editCreditCardInformation({ ...checkoutBillingData[0] });
        assertPriceAdjustmentsTextLanguage('fra');

        reviewOrder();
        cy.wait(
            [
                '@gqlsetBillingAddressMutation',
                '@gqlGetItemsInCartQuery',
                '@gqlsetSelectedPaymentMethodMutation'
            ],
            {
                timeout: 60000
            }
        );

        placeOrder();

        cy.wait(['@gqlplaceOrderMutation', '@gqlGetCheckoutDetailsQuery'], {
            timeout: 60000
        });

        assertOrderConfirmationPageTextLanguage('fra');
    });

    it('should show USD currency across app if it is selected inside French Store View', () => {
        cy.intercept('GET', getAutocompleteResultsCall).as(
            'gqlGetAutocompleteResultsQuery'
        );
        cy.intercept('GET', getProductDetailForProductPageCall).as(
            'gqlGetProductDetailForProductPageQuery'
        );

        cy.intercept('POST', hitGraphqlPath, req => {
            aliasMutation(req, 'AddProductToCart');
        });

        cy.visitHomePage();
        triggerCurrencySwitcherMenu();
        changeCurrency('USD');
        // wait page reload
        cy.wait(5000);

        // check search suggestion currency
        triggerSearch();
        searchFromSearchBar('Dress', false);
        cy.wait(['@gqlGetAutocompleteResultsQuery'], {
            timeout: 60000
        });
        assertProductSuggestionsHasCurrency('USD');

        //check Category page currency
        cy.visit(categoryTops.url);
        assertCategoryPageProductsHaveCurrency('USD');

        // Add configurable product to cart
        cy.visit(productIsadoraSkirt.url);
        cy.wait(['@gqlGetProductDetailForProductPageQuery'], {
            timeout: 60000
        });

        assertProductPriceHasCurrency('USD');
        selectOptionsFromProductPage();
        addToCartFromProductPage();

        cy.wait(['@gqlAddProductToCartMutation'], {
            timeout: 60000
        });

        // check miniCart currency
        triggerMiniCart();
        assertMiniCartProductHasCurrency('USD');

        // check cartPage currency
        goToCartPageFromEditCartButton();
        assertCartPageHasCurrency('USD');

        // check checkoutPage currency
        goToCheckout();
        assertCheckoutPageHasCurrency('USD');
    });

    it('should show french store view code in url', () => {
        cy.intercept('GET', getProductDetailForProductPageCall).as(
            'gqlGetProductDetailForProductPageQuery'
        );

        cy.intercept('POST', hitGraphqlPath, req => {
            aliasMutation(req, 'SignIn');
            aliasMutation(req, 'AddProductToCart');
        });

        cy.visitHomePage();

        cy.on('url:changed', newUrl => {
            const { pathname } = new URL(newUrl);
            if (pathname === '/') return;
            expect(pathname).to.contain('/fr');
        });

        // navigate across app's pages to validate store code in url
        cy.toggleLoginDialog();

        //create account and sign in
        cy.signInAccount(accountEmail, accountPassword);

        cy.wait(['@gqlSignInMutation'], {
            timeout: 60000
        });
        triggerAccountMenu();
        goToMyAccount(firstName, 'Historique des commandes');
        goToMyAccount(firstName, 'Listes de favoris');
        goToMyAccount(firstName, "Carnet d'adresses");
        goToMyAccount(firstName, 'Paiements enregistrés');
        goToMyAccount(firstName, 'Les communications');
        goToMyAccount(firstName, 'Information sur le compte');

        triggerSearch();
        searchFromSearchBar('Dress', true);
        selectCategoryFromMegaMenu('Blouses & Shirts');
        selectProductFromCategoryPage(productValeriaTwoLayeredTank.name);

        cy.wait(['@gqlGetProductDetailForProductPageQuery'], {
            timeout: 60000
        });

        selectOptionsFromProductPage();
        addToCartFromProductPage();
        cy.wait(['@gqlAddProductToCartMutation'], {
            timeout: 60000
        });

        triggerMiniCart();
        goToCartPageFromEditCartButton();
        goToCheckout();
    });

    it('should show default store view code in url', () => {
        cy.intercept('GET', getProductDetailForProductPageCall).as(
            'gqlGetProductDetailForProductPageQuery'
        );

        cy.intercept('POST', hitGraphqlPath, req => {
            aliasMutation(req, 'SignIn');
            aliasMutation(req, 'AddProductToCart');
        });

        cy.visitHomePage();
        triggerStoreSwitcherMenu();
        changeStoreView('Default Store View');
        // wait page reload
        cy.wait(5000);

        cy.on('url:changed', newUrl => {
            const { pathname } = new URL(newUrl);
            if (pathname === '/') return;
            expect(pathname).to.contain('/default');
        });

        // navigate across app's pages to validate store code in url
        cy.toggleLoginDialog();

        //create account and sign in
        cy.signInAccount(accountEmail, accountPassword);

        cy.wait(['@gqlSignInMutation'], {
            timeout: 60000
        });
        triggerAccountMenu();
        goToMyAccount(firstName, 'Order History');
        goToMyAccount(firstName, 'Favorites Lists');
        goToMyAccount(firstName, 'Address Book');
        goToMyAccount(firstName, 'Saved Payments');
        goToMyAccount(firstName, 'Communications');
        goToMyAccount(firstName, 'Account Information');

        triggerSearch();
        searchFromSearchBar('Dress', true);
        selectCategoryFromMegaMenu('Blouses & Shirts');
        selectProductFromCategoryPage(productValeriaTwoLayeredTank.name);

        cy.wait(['@gqlGetProductDetailForProductPageQuery'], {
            timeout: 60000
        });

        selectOptionsFromProductPage();
        addToCartFromProductPage();
        cy.wait(['@gqlAddProductToCartMutation'], {
            timeout: 60000
        });

        triggerMiniCart();
        goToCartPageFromEditCartButton();
        goToCheckout();
    });
});
