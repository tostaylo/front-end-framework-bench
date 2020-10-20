use crate::handle;
use std::cell::RefCell;
use std::rc::Rc;
#[derive(Default, Clone, Debug)]
pub struct TableProps {
    pub rows: i32,
    pub counter: usize,
    pub update_rows: i32,
}

#[derive(Debug, Default, Clone)]
pub struct Table {
    id: String,
    pub props: TableProps,
    words: Vec<String>,
}

impl Table {
    pub fn create() -> handle::Handle<Self> {
        let table = Table {
            id: "table".to_owned(),
            props: TableProps {
                rows: 0,
                counter: 0,
                update_rows: 0,
            },
            words: vec![
                "There".to_owned(),
                "High".to_owned(),
                "Lizards".to_owned(),
                "Sappy".to_owned(),
                "Wreck".to_owned(),
                "Fairly".to_owned(),
                "Barking".to_owned(),
                "Lurching".to_owned(),
                "Carbs".to_owned(),
                "Flat".to_owned(),
                "Hard".to_owned(),
                "Sad".to_owned(),
                "Butterfly".to_owned(),
                "Bandana".to_owned(),
            ],
        };
        handle::Handle(Rc::new(RefCell::new(table)))
    }
}

impl rust_fel::Component for handle::Handle<Table> {
    type Properties = TableProps;
    type Message = ();
    type State = ();

    fn add_props(&mut self, props: Self::Properties) {
        self.0.borrow_mut().props = props.clone();

        if props.update_rows == 0 {
            rust_fel::re_render(self.render(), Some(self.0.borrow().id.clone()));
        } else {
            // I could make a table row component here and call add props on it which would then decide to re-render or not.
            for num in 1..props.rows + 1 {
                if num % props.update_rows == 0 {
                    let id = format!("td{}", num);
                    // ALSO I DON"T HAVE TO REPLACE WHOLE ROW AS I CAN JUST REPLACE TABLE DATA
                    // THis forces the use of ID's everywhere
                    let table_row = rust_fel::html(format!("<td |id={}|>We are updated</td>", id));
                    rust_fel::re_render(table_row, Some(id));
                }
            }
        }
    }

    fn reduce_state(&mut self, _messaege: ()) {}

    fn render(&self) -> rust_fel::Element {
        let borrow = self.0.borrow_mut();
        let rows = borrow.props.rows;
        let mut el = None;
        let counter = borrow.props.counter;

        let mut main_table = rust_fel::html(format!("<table |id={}|></table>", borrow.id.clone()));

        if rows > 0 {
            let mut table_body = rust_fel::html("<tbody></tbody>".to_owned());
            let mut table_rows = vec![];

            for num in 1..rows + 1 {
                //use num here
                let t = match table_rows.len() {
                    x if x > 14 => x + counter,
                    x if x <= 14 => x + 14 + counter,
                    _ => 0,
                };
                table_rows.push(rust_fel::html(format!(
                    "<tr><td>{}</td><td |id=td{}|>{} {} {}</td></tr>",
                    num,
                    num,
                    borrow.words[t % 12],
                    borrow.words[t % 13],
                    borrow.words[t % 14],
                )));
            }
            table_body.props.children = Some(table_rows);

            el = Some(table_body);
        }

        let mut children = vec![];
        if let Some(x) = el {
            children.push(x);
        }
        main_table.props.children = Some(children);
        main_table
    }
}
