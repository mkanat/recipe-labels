"use client";

import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

interface LabelItem {
  id: string;
  temperature: number;
  time: number;
  instructions: string;
}

interface LabelDocumentProps {
  items: LabelItem[];
}

// 1 inch = 72 points
// Page: Letter = 8.5 x 11 inches = 612 x 792 points
// Label: 3 x 2 inches = 216 x 144 points
// Target: PLS504
// 2 Columns, 5 Rows.
// Top/Bottom margins approx 0.5" = 36pt
// Side margins approx 0.156" = 11.232pt
// Horizontal gap approx 0.188" = 13.536pt

const styles = StyleSheet.create({
  page: {
    paddingTop: "0.5in",
    paddingBottom: "0.5in",
    paddingLeft: "0.156in",
    paddingRight: "0.156in",
    flexDirection: "row",
    flexWrap: "wrap",
    // alignContent: 'flex-start',
    backgroundColor: "#ffffff",
  },
  label: {
    width: "3in",
    height: "2in",
    marginRight: "0.188in", // Note: every 2nd item shouldn't have margin right ideally, but flex space-between or wrapping handles it
    marginBottom: "0in",
    padding: "0.15in",
    fontFamily: "Helvetica",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    paddingBottom: 4,
  },
  headerText: {
    fontSize: 10,
    fontWeight: "bold",
  },
  instructions: {
    fontSize: 9,
    lineHeight: 1.2,
  },
});

export function LabelDocument({ items }: LabelDocumentProps) {
  // We need to group items into pages of 10 labels each
  const labelsPerPage = 10;
  const pages = [];

  for (let i = 0; i < items.length; i += labelsPerPage) {
    pages.push(items.slice(i, i + labelsPerPage));
  }

  // If no items, render an empty page just to not crash
  if (pages.length === 0) {
    pages.push([]);
  }

  return (
    <Document>
      {pages.map((pageItems, pageIndex) => (
        <Page key={`page-${pageIndex}`} size="LETTER" style={styles.page}>
          {pageItems.map((item, index) => {
            // Remove margin right for the second item in each row to fit exactly into Letter width
            const isRightColumn = index % 2 === 1;

            return (
              <View
                key={`${item.id}-${index}`}
                style={[styles.label, isRightColumn ? { marginRight: 0 } : {}]}
              >
                <View style={styles.header}>
                  <Text style={styles.headerText}>Temp: {item.temperature}°F</Text>
                  <Text style={styles.headerText}>Time: {item.time} min</Text>
                </View>
                <Text style={styles.instructions}>{item.instructions}</Text>
              </View>
            );
          })}
        </Page>
      ))}
    </Document>
  );
}
