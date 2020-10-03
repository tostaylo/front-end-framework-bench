use crate::handle;
use std::cell::RefCell;
use std::rc::Rc;

#[derive(Default, Clone, Debug)]
pub struct TableProps {
    pub rows: i32,
    pub counter: usize,
}

#[derive(Debug, Default, Clone)]
pub struct Table {
    id: String,
    props: TableProps,
    words: Vec<String>,
}

// impl fmt::Debug for TableProps {
//     fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
//         write!(f, "{:#?} table props", self.rows)
//     }
// }

impl Table {
    pub fn create() -> handle::Handle<Self> {
        let table = Table {
            id: "table".to_owned(),
            props: TableProps {
                rows: 0,
                counter: 0,
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
        self.0.borrow_mut().props = props;
        rust_fel::re_render(self.render(), Some(self.0.borrow().id.clone()));
    }

    fn reduce_state(&mut self, _messaege: ()) {
        ()
    }

    fn render(&self) -> rust_fel::Element {
        let borrow = self.0.borrow_mut();
        let rows = borrow.props.rows;
        let mut el = None;
        let counter = borrow.props.counter;

        if rows > 0 {
            let mut main_table = rust_fel::html("<table></table>".to_owned());
            let mut table_body = rust_fel::html("<tbody></tbody>".to_owned());
            let mut table_rows = vec![];

            for num in 0..rows {
                let t = match table_rows.len() {
                    x if x > 14 => x + counter,
                    x if x <= 14 => x + 14 + counter,
                    _ => 0,
                };
                table_rows.push(rust_fel::html(format!(
                    "<tr><td>{}</td><td>{} {} {}</td></tr>",
                    num + 1,
                    borrow.words[t % 12],
                    borrow.words[t % 13],
                    borrow.words[t % 14],
                )));
            }
            table_body.props.children = Some(table_rows);
            main_table.props.children = Some(vec![table_body]);
            el = Some(main_table);
        }

        let mut children = vec![];
        if let Some(x) = el {
            children.push(x);
        }
        rust_fel::Element::new(
            "div".to_owned(),
            rust_fel::Props {
                id: Some(borrow.id.clone()),
                children: Some(children),
                ..Default::default()
            },
        )
    }
}
