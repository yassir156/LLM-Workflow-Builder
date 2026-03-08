Attribute VB_Name = "ModuleLocation"
Option Explicit

' =========================
' Configuration centrale
' =========================
Public Const SHEET_PARAMETRES As String = "Parametres"
Public Const SHEET_VEHICULES As String = "Vehicules"
Public Const SHEET_CLIENTS As String = "Clients"
Public Const SHEET_RESERVATIONS As String = "Reservations"
Public Const SHEET_PAIEMENTS As String = "Paiements"
Public Const SHEET_ENTRETIEN As String = "Entretien"
Public Const SHEET_DASHBOARD As String = "Dashboard"
Public Const DATE_FMT As String = "dd/mm/yyyy"

' =========================
' Initialisation du mini logiciel
' =========================
Public Sub InitialiserMiniLogiciel()
    Application.ScreenUpdating = False
    Application.DisplayAlerts = False

    EnsureSheet SHEET_PARAMETRES
    EnsureSheet SHEET_VEHICULES
    EnsureSheet SHEET_CLIENTS
    EnsureSheet SHEET_RESERVATIONS
    EnsureSheet SHEET_PAIEMENTS
    EnsureSheet SHEET_ENTRETIEN
    EnsureSheet SHEET_DASHBOARD

    SetupParametres
    SetupVehicules
    SetupClients
    SetupReservations
    SetupPaiements
    SetupEntretien
    SetupDashboard

    Application.DisplayAlerts = True
    Application.ScreenUpdating = True

    MsgBox "Mini logiciel prêt ✅" & vbCrLf & "Tu peux commencer à saisir tes données.", vbInformation
End Sub

' =========================
' CRUD Véhicules
' =========================
Public Sub AjouterVehicule()
    Dim ws As Worksheet, nextRow As Long
    Dim immat As String, marque As String, modele As String, prixJour As Double

    Set ws = ThisWorkbook.Worksheets(SHEET_VEHICULES)
    immat = Trim(InputBox("Immatriculation :", "Nouveau véhicule"))
    If immat = "" Then Exit Sub

    marque = Trim(InputBox("Marque :", "Nouveau véhicule"))
    modele = Trim(InputBox("Modèle :", "Nouveau véhicule"))
    prixJour = CDbl(Val(InputBox("Prix par jour (DH) :", "Nouveau véhicule", "300")))

    nextRow = NextDataRow(ws)
    ws.Cells(nextRow, 1).Value = "VH-" & Format(nextRow - 1, "0000")
    ws.Cells(nextRow, 2).Value = immat
    ws.Cells(nextRow, 3).Value = marque
    ws.Cells(nextRow, 4).Value = modele
    ws.Cells(nextRow, 5).Value = "Disponible"
    ws.Cells(nextRow, 6).Value = prixJour
    ws.Cells(nextRow, 7).Value = 0
    ws.Cells(nextRow, 8).Value = 0

    MsgBox "Véhicule ajouté.", vbInformation
End Sub

Public Sub ModifierStatutVehicule()
    Dim ws As Worksheet, idVehicule As String, statut As String
    Dim cell As Range

    Set ws = ThisWorkbook.Worksheets(SHEET_VEHICULES)
    idVehicule = Trim(InputBox("ID véhicule (ex: VH-0001)", "Modifier statut"))
    If idVehicule = "" Then Exit Sub

    Set cell = ws.Columns(1).Find(What:=idVehicule, LookAt:=xlWhole)
    If cell Is Nothing Then
        MsgBox "ID introuvable.", vbExclamation
        Exit Sub
    End If

    statut = Trim(InputBox("Nouveau statut: Disponible / Reservee / Louee / Maintenance", "Modifier statut", cell.Offset(0, 4).Value))
    If statut = "" Then Exit Sub
    cell.Offset(0, 4).Value = statut

    MsgBox "Statut mis à jour.", vbInformation
End Sub

' =========================
' CRUD Clients
' =========================
Public Sub AjouterClient()
    Dim ws As Worksheet, nextRow As Long
    Dim nom As String, cin As String, tel As String

    Set ws = ThisWorkbook.Worksheets(SHEET_CLIENTS)
    nom = Trim(InputBox("Nom complet :", "Nouveau client"))
    If nom = "" Then Exit Sub

    cin = Trim(InputBox("CIN / Passeport :", "Nouveau client"))
    tel = Trim(InputBox("Téléphone :", "Nouveau client"))

    nextRow = NextDataRow(ws)
    ws.Cells(nextRow, 1).Value = "CL-" & Format(nextRow - 1, "0000")
    ws.Cells(nextRow, 2).Value = nom
    ws.Cells(nextRow, 3).Value = cin
    ws.Cells(nextRow, 4).Value = tel
    ws.Cells(nextRow, 5).Value = Trim(InputBox("Adresse :", "Nouveau client"))
    ws.Cells(nextRow, 6).Value = Trim(InputBox("N° permis :", "Nouveau client"))

    MsgBox "Client ajouté.", vbInformation
End Sub

' =========================
' Réservations / Départs / Retours
' =========================
Public Sub NouvelleReservation()
    Dim ws As Worksheet, nextRow As Long
    Dim idClient As String, idVehicule As String
    Dim dateDebut As Date, nbJours As Long, remisePct As Double
    Dim prixJour As Double, totalBrut As Double, totalNet As Double

    Set ws = ThisWorkbook.Worksheets(SHEET_RESERVATIONS)

    idClient = Trim(InputBox("ID client (CL-xxxx)", "Nouvelle réservation"))
    If idClient = "" Then Exit Sub

    idVehicule = Trim(InputBox("ID véhicule (VH-xxxx)", "Nouvelle réservation"))
    If idVehicule = "" Then Exit Sub

    dateDebut = CDate(InputBox("Date début (jj/mm/aaaa)", "Nouvelle réservation", Format(Date, DATE_FMT)))
    nbJours = CLng(Val(InputBox("Nombre de jours", "Nouvelle réservation", "1")))
    prixJour = CDbl(Val(InputBox("Prix jour DH", "Nouvelle réservation", "300")))
    remisePct = CDbl(Val(InputBox("Remise % (laisser 0 si aucune)", "Nouvelle réservation", "0")))

    totalBrut = nbJours * prixJour
    totalNet = Round(totalBrut * (1 - remisePct / 100), 2)

    nextRow = NextDataRow(ws)
    ws.Cells(nextRow, 1).Value = "CT-" & Format(nextRow - 1, "0000")
    ws.Cells(nextRow, 2).Value = idClient
    ws.Cells(nextRow, 3).Value = idVehicule
    ws.Cells(nextRow, 4).Value = dateDebut
    ws.Cells(nextRow, 5).Value = DateAdd("d", nbJours, dateDebut)
    ws.Cells(nextRow, 6).Value = nbJours
    ws.Cells(nextRow, 7).Value = prixJour
    ws.Cells(nextRow, 8).Value = remisePct
    ws.Cells(nextRow, 9).Value = totalNet
    ws.Cells(nextRow, 10).Value = "Réservée"
    ws.Cells(nextRow, 11).Value = ""
    ws.Cells(nextRow, 12).Value = ""

    MsgBox "Réservation créée : " & ws.Cells(nextRow, 1).Value, vbInformation
End Sub

Public Sub MarquerDepart()
    ChangerStatutReservation "En cours"
End Sub

Public Sub MarquerRetour()
    ChangerStatutReservation "Terminée"
End Sub

Public Sub AnnulerReservation()
    ChangerStatutReservation "Annulée"
End Sub

Public Sub ProlongerReservation()
    Dim ws As Worksheet, idContrat As String, extraDays As Long
    Dim cell As Range

    Set ws = ThisWorkbook.Worksheets(SHEET_RESERVATIONS)
    idContrat = Trim(InputBox("N° contrat CT-xxxx", "Prolongation"))
    If idContrat = "" Then Exit Sub

    Set cell = ws.Columns(1).Find(What:=idContrat, LookAt:=xlWhole)
    If cell Is Nothing Then
        MsgBox "Contrat introuvable.", vbExclamation
        Exit Sub
    End If

    extraDays = CLng(Val(InputBox("Nombre de jours supplémentaires", "Prolongation", "1")))
    If extraDays <= 0 Then Exit Sub

    cell.Offset(0, 4).Value = DateAdd("d", extraDays, cell.Offset(0, 4).Value)
    cell.Offset(0, 5).Value = cell.Offset(0, 5).Value + extraDays
    cell.Offset(0, 8).Value = cell.Offset(0, 5).Value * cell.Offset(0, 6).Value * (1 - cell.Offset(0, 7).Value / 100)

    MsgBox "Prolongation enregistrée.", vbInformation
End Sub

Private Sub ChangerStatutReservation(ByVal nouveauStatut As String)
    Dim ws As Worksheet, idContrat As String, cell As Range

    Set ws = ThisWorkbook.Worksheets(SHEET_RESERVATIONS)
    idContrat = Trim(InputBox("N° contrat CT-xxxx", "Statut réservation"))
    If idContrat = "" Then Exit Sub

    Set cell = ws.Columns(1).Find(What:=idContrat, LookAt:=xlWhole)
    If cell Is Nothing Then
        MsgBox "Contrat introuvable.", vbExclamation
        Exit Sub
    End If

    cell.Offset(0, 9).Value = nouveauStatut
    If nouveauStatut = "En cours" Then cell.Offset(0, 10).Value = Now
    If nouveauStatut = "Terminée" Then cell.Offset(0, 11).Value = Now

    MsgBox "Statut mis à jour : " & nouveauStatut, vbInformation
End Sub

' =========================
' Paiements
' =========================
Public Sub AjouterPaiement()
    Dim ws As Worksheet, nextRow As Long
    Dim contrat As String, montant As Double

    Set ws = ThisWorkbook.Worksheets(SHEET_PAIEMENTS)
    contrat = Trim(InputBox("N° contrat CT-xxxx", "Nouveau paiement"))
    If contrat = "" Then Exit Sub

    montant = CDbl(Val(InputBox("Montant payé (DH)", "Nouveau paiement", "0")))
    If montant <= 0 Then Exit Sub

    nextRow = NextDataRow(ws)
    ws.Cells(nextRow, 1).Value = "PY-" & Format(nextRow - 1, "0000")
    ws.Cells(nextRow, 2).Value = contrat
    ws.Cells(nextRow, 3).Value = Date
    ws.Cells(nextRow, 4).Value = montant
    ws.Cells(nextRow, 5).Value = Trim(InputBox("Mode (Espèces/Virement/Carte)", "Nouveau paiement", "Espèces"))

    MsgBox "Paiement ajouté.", vbInformation
End Sub

' =========================
' Recherche rapide
' =========================
Public Sub RechercheGlobale()
    Dim critere As String
    critere = Trim(InputBox("Recherche par CIN, nom client, immatriculation, numéro contrat ou date (jj/mm/aaaa)", "Recherche"))
    If critere = "" Then Exit Sub

    If TrouverEtActiver(SHEET_CLIENTS, 2, critere) Then Exit Sub
    If TrouverEtActiver(SHEET_CLIENTS, 3, critere) Then Exit Sub
    If TrouverEtActiver(SHEET_VEHICULES, 2, critere) Then Exit Sub
    If TrouverEtActiver(SHEET_RESERVATIONS, 1, critere) Then Exit Sub
    If TrouverEtActiver(SHEET_RESERVATIONS, 4, critere) Then Exit Sub

    MsgBox "Aucun résultat.", vbInformation
End Sub

Private Function TrouverEtActiver(ByVal sheetName As String, ByVal colIndex As Long, ByVal valueToFind As String) As Boolean
    Dim ws As Worksheet, foundCell As Range
    Set ws = ThisWorkbook.Worksheets(sheetName)

    Set foundCell = ws.Columns(colIndex).Find(What:=valueToFind, LookAt:=xlPart)
    If Not foundCell Is Nothing Then
        ws.Activate
        foundCell.Select
        TrouverEtActiver = True
    Else
        TrouverEtActiver = False
    End If
End Function

' =========================
' Dashboard et alertes rouges
' =========================
Public Sub RafraichirDashboard()
    Dim wsD As Worksheet
    Set wsD = ThisWorkbook.Worksheets(SHEET_DASHBOARD)

    wsD.Range("B2").Formula = "=COUNTA(" & SHEET_RESERVATIONS & "!A:A)-1"
    wsD.Range("B3").Formula = "=SUM(" & SHEET_RESERVATIONS & "!I:I)"
    wsD.Range("B4").Formula = "=SUM(" & SHEET_PAIEMENTS & "!D:D)"
    wsD.Range("B5").Formula = "=B3-B4"

    MettreAlerteRouge ThisWorkbook.Worksheets(SHEET_RESERVATIONS), 5, "<" & CLng(Date)

    MsgBox "Dashboard mis à jour.", vbInformation
End Sub

Private Sub MettreAlerteRouge(ByVal ws As Worksheet, ByVal colDate As Long, ByVal conditionStr As String)
    Dim rng As Range
    Set rng = ws.Range(ws.Cells(2, colDate), ws.Cells(5000, colDate))

    rng.FormatConditions.Delete
    rng.FormatConditions.Add Type:=xlCellValue, Operator:=xlLess, Formula1:=CLng(Date)
    rng.FormatConditions(1).Interior.Color = RGB(255, 199, 206)
    rng.FormatConditions(1).Font.Color = RGB(156, 0, 6)
End Sub

' =========================
' Helpers structure
' =========================
Private Sub EnsureSheet(ByVal sheetName As String)
    On Error Resume Next
    Dim ws As Worksheet
    Set ws = ThisWorkbook.Worksheets(sheetName)
    On Error GoTo 0

    If ws Is Nothing Then
        ThisWorkbook.Worksheets.Add(After:=ThisWorkbook.Worksheets(ThisWorkbook.Worksheets.Count)).Name = sheetName
    End If
End Sub

Private Function NextDataRow(ByVal ws As Worksheet) As Long
    If Application.WorksheetFunction.CountA(ws.Cells) = 0 Then
        NextDataRow = 2
    Else
        NextDataRow = ws.Cells(ws.Rows.Count, 1).End(xlUp).Row + 1
        If NextDataRow < 2 Then NextDataRow = 2
    End If
End Function

Private Sub SetupParametres()
    Dim ws As Worksheet
    Set ws = ThisWorkbook.Worksheets(SHEET_PARAMETRES)
    ws.Cells.Clear
    ws.Range("A1:B1").Value = Array("Paramètre", "Valeur")
    ws.Range("A2:B2").Value = Array("Agence", "Sefrou")
    ws.Range("A3:B3").Value = Array("Devise", "DH")
    ws.Range("A4:B4").Value = Array("Format date", DATE_FMT)
End Sub

Private Sub SetupVehicules()
    Dim ws As Worksheet
    Set ws = ThisWorkbook.Worksheets(SHEET_VEHICULES)
    ws.Cells.Clear
    ws.Range("A1:H1").Value = Array("ID Vehicule", "Immatriculation", "Marque", "Modele", "Statut", "Prix/Jour DH", "Montant Total Loue", "Reste a Payer")
End Sub

Private Sub SetupClients()
    Dim ws As Worksheet
    Set ws = ThisWorkbook.Worksheets(SHEET_CLIENTS)
    ws.Cells.Clear
    ws.Range("A1:F1").Value = Array("ID Client", "Nom Complet", "CIN", "Telephone", "Adresse", "Permis")
End Sub

Private Sub SetupReservations()
    Dim ws As Worksheet
    Set ws = ThisWorkbook.Worksheets(SHEET_RESERVATIONS)
    ws.Cells.Clear
    ws.Range("A1:L1").Value = Array("No Contrat", "ID Client", "ID Vehicule", "Date Debut", "Date Fin", "Nb Jours", "Prix Jour DH", "Remise %", "Total DH", "Statut", "Etat Depart", "Etat Retour")
    ws.Columns("D:E").NumberFormat = DATE_FMT
End Sub

Private Sub SetupPaiements()
    Dim ws As Worksheet
    Set ws = ThisWorkbook.Worksheets(SHEET_PAIEMENTS)
    ws.Cells.Clear
    ws.Range("A1:E1").Value = Array("ID Paiement", "No Contrat", "Date Paiement", "Montant DH", "Mode")
    ws.Columns("C:C").NumberFormat = DATE_FMT
End Sub

Private Sub SetupEntretien()
    Dim ws As Worksheet
    Set ws = ThisWorkbook.Worksheets(SHEET_ENTRETIEN)
    ws.Cells.Clear
    ws.Range("A1:G1").Value = Array("ID Entretien", "ID Vehicule", "Date", "Type", "Cout DH", "Observation", "Bloquant")
    ws.Columns("C:C").NumberFormat = DATE_FMT
End Sub

Private Sub SetupDashboard()
    Dim ws As Worksheet
    Set ws = ThisWorkbook.Worksheets(SHEET_DASHBOARD)
    ws.Cells.Clear
    ws.Range("A1:B1").Value = Array("Indicateur", "Valeur")
    ws.Range("A2:A5").Value = Application.Transpose(Array("Nb Contrats", "CA Total DH", "Total Payé DH", "Reste Global DH"))
End Sub
