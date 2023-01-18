/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import { ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store"
import userEvent from '@testing-library/user-event'
jest.mock("../app/store", () => mockStore)

import router from "../app/Router.js";


describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    
    test("Then mail icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
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

    // describe("When I click on choose file", () => {
    //   test("Then I can upload a jpg, jpeg or png file", ()=> {

    //   })
    // })

    // describe("When I upload a jpg, jpeg or png file", () => {
    //   test("The file is saved", ()=> {

    //   })
    // })

  })
  
})

// //Integration test POST new Bill
// describe("Given I am a user connected as Employee", () => { 
//   describe("When I have completed a form and click submit", () => {
//     test()

//   })



// })
