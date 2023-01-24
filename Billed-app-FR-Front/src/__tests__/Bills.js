/**
 * @jest-environment jsdom
 */

import {screen, waitFor} from "@testing-library/dom"
import userEvent from '@testing-library/user-event'
import BillsUI from "../views/BillsUI.js"
import {bills} from "../fixtures/bills.js"
import {ROUTES, ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import Bills from '../containers/Bills.js';
import mockStore from "../__mocks__/store"

jest.mock("../app/store", () => mockStore)

import router from "../app/Router.js";
import DashboardFormUI from "../views/DashboardFormUI.js";
import Dashboard from "../containers/Dashboard.js";

describe("Given I am connected as an employee", () => {
    describe("When I am on Bills Page", () => {
        test("Then bill icon in vertical layout should be highlighted", async () => {

            Object.defineProperty(window, 'localStorage', {value: localStorageMock})
            window.localStorage.setItem('user', JSON.stringify({
                type: 'Employee'
            }))
            const root = document.createElement("div")
            root.setAttribute("id", "root")
            document.body.append(root)
            router()
            window.onNavigate(ROUTES_PATH.Bills)
            await waitFor(() => screen.getByTestId('icon-window'))
            const windowIcon = screen.getByTestId('icon-window')
            //to-do write expect expression(DONE)
            expect((windowIcon).classList).toContain("active-icon");
        })
        test("Then bills should be ordered from earliest to latest", () => {
            document.body.innerHTML = BillsUI({data: bills})
            const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
            const antiChrono = (a, b) => ((a < b) ? 1 : -1)
            const datesSorted = [...dates].sort(antiChrono)
            expect(dates).toEqual(datesSorted)
        })

        describe("When I click on new bill button", () => {
          test("Then it should open new Bill page", () => {
                Object.defineProperty(window, 'localStorage', {value: localStorageMock})
                window.localStorage.setItem('user', JSON.stringify({
                    type: 'Employee'
                }))
                document.body.innerHTML = BillsUI({data: bills})
                const onNavigate = jest.fn()/*(pathname) => {
                    document.body.innerHTML = ROUTES({pathname})
                }*/
                const store = null
                const _bills = new Bills({
                    document, onNavigate, store, localStorage: window.localStorage
                })

                const handleClickNewBill = jest.fn(_bills.handleClickNewBill)
                const newBillBtn = screen.getAllByTestId('btn-new-bill')[0]
                newBillBtn.addEventListener('click', () => handleClickNewBill())
                userEvent.click(newBillBtn)

                expect(onNavigate).toHaveBeenCalledWith('#employee/bill/new')
          })
        })

        describe("When I click on the eye icon", () => {
            test("Then it should open the receipt modal", () => {
                Object.defineProperty(window, 'localStorage', {value: localStorageMock})
                window.localStorage.setItem('user', JSON.stringify({
                    type: 'Employee'
                }))
                document.body.innerHTML = BillsUI({data: bills})
                const onNavigate = (pathname) => {
                    document.body.innerHTML = ROUTES({pathname})
                }
                const store = null
                const _bills = new Bills({
                    document, onNavigate, store, localStorage: window.localStorage
                })
                $.fn.modal = jest.fn()

                const handleClickIconEye = jest.fn(_bills.handleClickIconEye)
                const eye = screen.getAllByTestId('icon-eye')[0]
                eye.addEventListener('click', () => handleClickIconEye(eye))
                userEvent.click(eye)

                expect(handleClickIconEye).toHaveBeenCalled()
                const modale = screen.getByTestId('modaleFile')
                expect(modale).toBeTruthy()
            })
        })


    })

})

// test d'intégration getBills
describe("Given I am a user connected as Employee", () => {
    describe("When I navigate to Bills", () => {
        test("fetches bills from mock API GET", async () => {
            localStorage.setItem("user", JSON.stringify({type: "Employee", email: "a@a"}));
            const root = document.createElement("div")
            root.setAttribute("id", "root")
            document.body.append(root)
            router()
            window.onNavigate(ROUTES_PATH.Dashboard)
            await waitFor(() => screen.getByText("Validations"))
            expect(screen.getByTestId("tbody")).toBeTruthy()
        })
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
            test("fetches bills from an API and fails with 404 message error", async () => {

                mockStore.bills.mockImplementationOnce(() => {
                    return {
                        list: () => {
                            return Promise.reject(new Error("Erreur 404"))
                        }
                    }
                })
                window.onNavigate(ROUTES_PATH.Bills)
                await new Promise(process.nextTick);
                const message = await screen.getByText(/Erreur 404/)
                expect(message).toBeTruthy()
            })

            test("fetches messages from an API and fails with 500 message error", async () => {

                mockStore.bills.mockImplementationOnce(() => {
                    return {
                        list: () => {
                            return Promise.reject(new Error("Erreur 500"))
                        }
                    }
                })

                window.onNavigate(ROUTES_PATH.Bills)
                await new Promise(process.nextTick);
                const message = await screen.getByText(/Erreur 500/)
                expect(message).toBeTruthy()
            })
        })

    })
})
