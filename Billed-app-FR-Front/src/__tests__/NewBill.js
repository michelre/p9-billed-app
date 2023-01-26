/**
 * @jest-environment jsdom
 */

import {fireEvent, screen, waitFor} from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import {ROUTES, ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store"
import userEvent from '@testing-library/user-event'

jest.mock("../app/store", () => mockStore);

import router from "../app/Router.js";


describe("Given I am connected as an employee", () => {
    describe("When I am on NewBill Page", () => {

        test("Then mail icon in vertical layout should be highlighted", async () => {
            Object.defineProperty(window, 'localStorage', {value: localStorageMock})
            window.localStorage.setItem('user', JSON.stringify({
                type: 'Employee'
            }))
            const root = document.createElement("div")
            root.setAttribute("id", "root")
            document.body.append(root)
            router()
            window.onNavigate(ROUTES_PATH.NewBill)
            await waitFor(() => screen.getByTestId('icon-mail'))
            const mailIcon = screen.getByTestId('icon-mail')

            expect((mailIcon).classList).toContain("active-icon");
        })

        test("Then the new bill form should be displayed", () => {
            const html = NewBillUI()
            document.body.innerHTML = html

            expect(screen.getByTestId("form-new-bill")).toBeTruthy();
            expect(screen.getByTestId("expense-type")).toBeTruthy();
            expect(screen.getByTestId("datepicker")).toBeTruthy();
            expect(screen.getByTestId("amount")).toBeTruthy();
            expect(screen.getByTestId("pct")).toBeTruthy();
            expect(screen.getByTestId("vat")).toBeTruthy();
            expect(screen.getByTestId("commentary")).toBeTruthy();
            expect(screen.getByTestId("file")).toBeTruthy();
        })

    })

    describe("When I am on NewBill Page and I click on submit button", () => {
        test("A bill is updated ", () => {
            Object.defineProperty(window, "localStorage", {value: localStorageMock});
            window.localStorage.setItem(
                "user",
                JSON.stringify({
                    type: "Employee",
                })
            );
            const onNavigate = (pathname) => {
                document.body.innerHTML = ROUTES({pathname});
            };

            const html = NewBillUI();
            document.body.innerHTML = html;

            const newBillBoard = new NewBill({
                document,
                onNavigate,
                store: null,
                localStorage: window.localStorage,
            });

            const handleSubmitMoked = jest.fn(newBillBoard.handleSubmit);
            const updateBillMocked = jest.fn()
            newBillBoard.updateBill = updateBillMocked

            const submit = screen.getByTestId("form-new-bill");

            submit.addEventListener("submit", () => handleSubmitMoked(
                {
                    preventDefault: () => {},
                    target: {
                        querySelector: () => ({
                            value: ''
                        })
                    }
                }
            ));
            fireEvent.submit(submit);

            expect(handleSubmitMoked).toHaveBeenCalled();
            expect(updateBillMocked).toHaveBeenCalled()
        });

        test("A new bill is created", () => {
            Object.defineProperty(window, "localStorage", {value: localStorageMock});
            window.localStorage.setItem(
                "user",
                JSON.stringify({
                    type: "Employee",
                })
            );
            const onNavigate = (pathname) => {
                document.body.innerHTML = ROUTES({pathname});
            };

            const html = NewBillUI();
            document.body.innerHTML = html;

            const newBillBoard = new NewBill({
                document,
                onNavigate,
                store: mockStore,
                localStorage: window.localStorage,
            });

            const handleChangeFileMocked = jest.fn(newBillBoard.handleChangeFile);
            const storeBillsCreate = jest.fn(() => Promise.resolve({fileUrl: 'fileUrl', key: 'key'}))
            mockStore.bills().create = storeBillsCreate

            const file = screen.getByTestId("file");
            file.addEventListener('change', () => handleChangeFileMocked({
                preventDefault: () => {},
                target: {
                    value: ''
                }
            }))
            fireEvent.change(file, {
                target: {
                    files: [new File(['(⌐□_□)'], 'chucknorris.png', {type: 'image/png'})],
                },
            })

            expect(handleChangeFileMocked).toHaveBeenCalled();
            expect(storeBillsCreate).toHaveBeenCalled()
        });

        test("A new bill is not created if uploaded file has wrong extension", () => {
            Object.defineProperty(window, "localStorage", {value: localStorageMock});
            window.localStorage.setItem(
                "user",
                JSON.stringify({
                    type: "Employee",
                })
            );
            const onNavigate = (pathname) => {
                document.body.innerHTML = ROUTES({pathname});
            };

            const html = NewBillUI();
            document.body.innerHTML = html;

            const newBillBoard = new NewBill({
                document,
                onNavigate,
                store: mockStore,
                localStorage: window.localStorage,
            });

            const handleChangeFileMocked = jest.fn(newBillBoard.handleChangeFile);
            const storeBillsCreate = jest.fn(() => Promise.resolve({fileUrl: 'fileUrl', key: 'key'}))
            mockStore.bills().create = storeBillsCreate
            const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {})

            const file = screen.getByTestId("file");
            file.addEventListener('change', () => handleChangeFileMocked({
                preventDefault: () => {},
                target: {
                    value: ''
                }
            }))
            fireEvent.change(file, {
                target: {
                    files: [new File(['(⌐□_□)'], 'chucknorris.txt', {type: 'text/txt'})],
                },
            })

            expect(handleChangeFileMocked).toHaveBeenCalled();
            expect(storeBillsCreate).not.toHaveBeenCalled()
            expect(alertMock).toHaveBeenCalledWith("Uniquement fichiers jpg, jpeg ou png acceptés'")
        });
    });

    // //Integration test POST new Bill
    /**
     * Logique mise en place:
     * - On teste les cas d'erreur (404 & 500) via les tests d'intégration lors de la création d'une facture
     * - Si une erreur arrive, il n'y a rien qui s'affiche à l'écran, juste un log d'erreur dans la console
     * - Préparation du test: Mocker la fonction console.error et provoquer l'erreur 500 ou 404 lors de l'appel à la fonction update du store
     * - Exécution du test: Soumettre le formulaire
     * - Vérification: S'assurer que le console.error a bien été appelée avec l'erreur 500 ou 404
     */
    describe("When an error occurs on API", () => {
        beforeEach(() => {
            jest.spyOn(mockStore, "bills")
            Object.defineProperty(
                window,
                'localStorage',
                {value: localStorageMock}
            )
            window.localStorage.setItem('user', JSON.stringify({
                type: 'Employee',
                email: "a@a"
            }))
            const root = document.createElement("div")
            root.setAttribute("id", "root")
            document.body.appendChild(root)
            router()
        })
        test("create a bill from an API and fails with 404 message error", async () => {

            mockStore.bills.mockImplementationOnce(() => {
                return {
                    update:() => {
                        return Promise.reject(new Error("Erreur 404"))
                    }
                }
            })

            const error = jest.spyOn(console, "error").mockImplementation(() => {});

            window.onNavigate(ROUTES_PATH.NewBill)
            const submit = screen.getAllByTestId("form-new-bill")[0];
            fireEvent.submit(submit)

            await new Promise(process.nextTick);
            expect(error).toHaveBeenCalledWith(new Error('Erreur 404'))
        })

        test("create a bill from an API and fails with 500 message error", async () => {

            mockStore.bills.mockImplementationOnce(() => {
                return {
                    update: () => {
                        return Promise.reject(new Error("Erreur 500"))
                    }
                }
            })

            const error = jest.spyOn(console, "error").mockImplementation(() => {
            });

            window.onNavigate(ROUTES_PATH.NewBill)
            const submit = screen.getAllByTestId("form-new-bill")[0];
            fireEvent.submit(submit)

            await new Promise(process.nextTick);
            expect(error).toHaveBeenCalledWith(new Error('Erreur 500'))
        })
    })

})