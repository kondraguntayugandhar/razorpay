package com.thirdprd.payment.api;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping({"/api/v1/payment-methods", "/api/payment-methods"})
public class PaymentMethodsController {

    @GetMapping("/netbanking")
    public ResponseEntity<Map<String, Object>> getNetbankingBanks() {
        Map<String, String> banks = new LinkedHashMap<>();
        
        // All Registered Public, Private, Small Finance, Payments & Foreign Banks in India
        banks.put("SBIN", "State Bank of India");
        banks.put("HDFC", "HDFC Bank");
        banks.put("ICIC", "ICICI Bank");
        banks.put("UTIB", "Axis Bank");
        banks.put("KKBK", "Kotak Mahindra Bank");
        banks.put("BARB_R", "Bank of Baroda");
        banks.put("CNRB", "Canara Bank");
        banks.put("PUNB_R", "Punjab National Bank");
        banks.put("UBIN", "Union Bank of India");
        banks.put("BKID", "Bank of India");
        banks.put("IDIB", "Indian Bank");
        banks.put("CBIN", "Central Bank of India");
        banks.put("IOBA", "Indian Overseas Bank");
        banks.put("MAHB", "Bank of Maharashtra");
        banks.put("PSIB", "Punjab & Sind Bank");
        banks.put("UCBA", "UCO Bank");
        banks.put("INDB", "IndusInd Bank");
        banks.put("IDFB", "IDFC FIRST Bank");
        banks.put("YESB", "Yes Bank");
        banks.put("FDRL", "Federal Bank");
        banks.put("RATN", "RBL Bank");
        banks.put("SIBL", "South Indian Bank");
        banks.put("KVBL", "Karur Vysya Bank");
        banks.put("CIUB", "City Union Bank");
        banks.put("KARB", "Karnataka Bank");
        banks.put("TMBL", "Tamilnad Mercantile Bank");
        banks.put("JAKA", "Jammu & Kashmir Bank");
        banks.put("BDBL", "Bandhan Bank");
        banks.put("DCBL", "DCB Bank");
        banks.put("DLXB", "Dhanlaxmi Bank");
        banks.put("IBKL", "IDBI Bank");
        banks.put("CSBK", "CSB Bank");
        banks.put("NTBL", "Nainital Bank");
        banks.put("AUBL", "AU Small Finance Bank");
        banks.put("ESFB", "Equitas Small Finance Bank");
        banks.put("UJJN", "Ujjivan Small Finance Bank");
        banks.put("JSFB", "Jana Small Finance Bank");
        banks.put("CSFB", "Capital Small Finance Bank");
        banks.put("FCSB", "Fincare Small Finance Bank");
        banks.put("SSFB", "Suryoday Small Finance Bank");
        banks.put("USFB", "Utkarsh Small Finance Bank");
        banks.put("SHIV", "Shivalik Small Finance Bank");
        banks.put("UNTY", "Unity Small Finance Bank");
        banks.put("AIRP", "Airtel Payments Bank");
        banks.put("IPPB", "India Post Payments Bank");
        banks.put("PYTM", "Paytm Payments Bank");
        banks.put("FINO", "Fino Payments Bank");
        banks.put("NSDL", "NSDL Payments Bank");
        banks.put("JIOB", "Jio Payments Bank");
        banks.put("DBSS", "DBS Bank India");
        banks.put("DEUT", "Deutsche Bank");
        banks.put("SCBL", "Standard Chartered Bank");
        banks.put("HSBC", "HSBC Bank India");
        banks.put("CITI", "Citibank India");
        banks.put("BARC", "Barclays Bank");
        banks.put("BOFA", "Bank of America");
        banks.put("SBM", "State Bank of Mauritius");

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("success", true);
        response.put("data", banks);

        return ResponseEntity.ok(response);
    }
}
